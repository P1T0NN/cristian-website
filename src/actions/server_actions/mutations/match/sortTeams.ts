"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function sortTeams(authToken: string, matchId: string) {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: t('MATCH_ID_INVALID') };
    }

    // Call the Supabase RPC function
    const { data, error } = await supabase.rpc('sort_teams', {
        p_match_id: matchId
    });
    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('TEAMS_SORT_FAILED'), error: error.message };
    }

    if (!result.success) {
        return { success: false, message: t(result.code, result.metadata) };
    }

    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);
    revalidatePath("/");

    return { success: true, message: t(result.code, result.metadata) };
}

/*

OUR SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION sort_teams(p_match_id UUID) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_team1_count INT := 0;
    v_team2_count INT := 0;
    v_total_players INT := 0;
    v_max_players INT;
    v_players_per_team INT;
BEGIN
    -- Fetch match data
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_ID_INVALID');
    END IF;

    -- Determine max players per team based on match type
    CASE v_match.match_type
        WHEN 'F7' THEN v_max_players := 7;
        WHEN 'F8' THEN v_max_players := 8;
        WHEN 'F11' THEN v_max_players := 11;
        ELSE v_max_players := 11;
    END CASE;

    -- Count total players (including temporary players)
    SELECT COUNT(*) INTO v_total_players 
    FROM (
        SELECT id FROM match_players WHERE match_id = p_match_id
        UNION ALL
        SELECT id FROM temporary_players WHERE match_id = p_match_id
    ) AS all_players;

    -- Calculate players per team
    v_players_per_team := v_total_players / 2;

    -- Sort players into teams (including temporary players)
    FOR v_player IN 
        SELECT * FROM (
            SELECT id, 'regular' AS player_type FROM match_players WHERE match_id = p_match_id
            UNION ALL
            SELECT id, 'temporary' AS player_type FROM temporary_players WHERE match_id = p_match_id
        ) AS all_players
        ORDER BY RANDOM()
    LOOP
        IF v_team1_count < v_players_per_team THEN
            IF v_player.player_type = 'regular' THEN
                UPDATE match_players SET team_number = 1 WHERE id = v_player.id;
            ELSE
                UPDATE temporary_players SET team_number = 1 WHERE id = v_player.id;
            END IF;
            v_team1_count := v_team1_count + 1;
        ELSIF v_team2_count < v_players_per_team THEN
            IF v_player.player_type = 'regular' THEN
                UPDATE match_players SET team_number = 2 WHERE id = v_player.id;
            ELSE
                UPDATE temporary_players SET team_number = 2 WHERE id = v_player.id;
            END IF;
            v_team2_count := v_team2_count + 1;
        ELSE
            -- If there's an odd player, randomly assign to team 1 or 2
            IF random() < 0.5 THEN
                IF v_player.player_type = 'regular' THEN
                    UPDATE match_players SET team_number = 1 WHERE id = v_player.id;
                ELSE
                    UPDATE temporary_players SET team_number = 1 WHERE id = v_player.id;
                END IF;
                v_team1_count := v_team1_count + 1;
            ELSE
                IF v_player.player_type = 'regular' THEN
                    UPDATE match_players SET team_number = 2 WHERE id = v_player.id;
                ELSE
                    UPDATE temporary_players SET team_number = 2 WHERE id = v_player.id;
                END IF;
                v_team2_count := v_team2_count + 1;
            END IF;
        END IF;
    END LOOP;

    -- Update match to indicate teams have been sorted
    UPDATE matches SET has_teams = true WHERE id = p_match_id;

    RETURN jsonb_build_object('success', true, 'code', 'TEAMS_SORTED_SUCCESSFULLY');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNKNOWN_ERROR', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/