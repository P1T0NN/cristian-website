"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

export async function finishMatch(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken || !matchId) {
        return { success: false, message: genericMessages(authToken ? 'MATCH_ID_INVALID' : 'UNAUTHORIZED') };
    }

    const verifyResult = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
    if (!verifyResult) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    // We use supabase.rpc here, because finish match is complex function, so its better to handle all in one supabase call to DB. At the bottom of the file is SQL we run into SUpabase
    const { data: result, error } = await supabase.rpc('finish_match', { p_match_id: matchId });

    if (error || !result.success) {
        console.error('Match finish failed:', result?.message || error?.message);
        return { 
            success: false, 
            message: genericMessages('MATCH_FINISH_FAILED'),
            error: result?.message || error?.message
        };
    }

    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);
    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_FINISHED") };
}

/*

CREATE OR REPLACE FUNCTION finish_match(p_match_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_new_debt NUMERIC;
    v_error_message TEXT;
BEGIN
    -- Fetch match data
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Match not found');
    END IF;

    -- Insert into match_history
    BEGIN
        INSERT INTO match_history (
            id, price, team1_name, team2_name, starts_at_day, starts_at_hour,
            match_type, match_gender, created_at, location, added_by,
            location_url, team1_color, team2_color, match_instructions, finished_at
        ) VALUES (
            v_match.id, v_match.price, v_match.team1_name, v_match.team2_name,
            v_match.starts_at_day, v_match.starts_at_hour, v_match.match_type,
            v_match.match_gender, v_match.created_at, v_match.location, v_match.added_by,
            v_match.location_url, v_match.team1_color, v_match.team2_color,
            v_match.match_instructions, NOW()
        );
    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RETURN jsonb_build_object('success', false, 'message', 'Failed to insert into match_history: ' || v_error_message);
    END;

    -- Process each player
    FOR v_player IN SELECT * FROM match_players WHERE match_id = p_match_id
    LOOP
        IF NOT v_player.has_paid AND NOT v_player.has_gratis THEN
            -- Update user's player_debt
            BEGIN
                UPDATE users
                SET player_debt = COALESCE(player_debt, 0) + v_match.price
                WHERE id = v_player.user_id
                RETURNING player_debt INTO v_new_debt;
            EXCEPTION
                WHEN OTHERS THEN
                    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
                    RETURN jsonb_build_object('success', false, 'message', 'Failed to update user debt: ' || v_error_message);
            END;

            -- Insert into debts table
            BEGIN
                INSERT INTO debts (player_name, player_debt, cristian_debt, reason, added_by)
                SELECT 
                    "fullName",  -- Note the double quotes around fullName
                    v_match.price,
                    0,
                    'Unpaid match fee for match on ' || v_match.starts_at_day,
                    'System'
                FROM users
                WHERE id = v_player.user_id;
            EXCEPTION
                WHEN OTHERS THEN
                    GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
                    RETURN jsonb_build_object('success', false, 'message', 'Failed to insert into debts table: ' || v_error_message);
            END;
        END IF;
    END LOOP;

    -- Delete the match
    BEGIN
        DELETE FROM matches WHERE id = p_match_id;
    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RETURN jsonb_build_object('success', false, 'message', 'Failed to delete match: ' || v_error_message);
    END;

    RETURN jsonb_build_object('success', true, 'message', 'Match finished successfully');
EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RETURN jsonb_build_object('success', false, 'message', 'Unexpected error: ' || v_error_message);
END;
$$ LANGUAGE plpgsql;

*/