"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function managePlayer(
    authToken: string,
    matchId: string,
    userId: string,
    teamNumber: 1 | 2,
    action: 'join' | 'leave' | 'requestSubstitute' | 'replacePlayer' | 'switchTeam'
): Promise<{ success: boolean; message: string; metadata?: Record<string, unknown> }> {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload || typeof payload.sub !== 'string') {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    if (!matchId || !userId || !teamNumber || !action) {
        return { success: false, message: t('MATCH_FETCH_INVALID_REQUEST') };
    }

    const { data, error } = await supabase.rpc('manage_player', {
        p_auth_user_id: payload.sub,
        p_match_id: matchId,
        p_user_id: userId,
        p_team_number: teamNumber,
        p_action: action
    });

    const result = data as RPCResponseData;

    if (error) {
        console.error('RPC Error:', error);
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { 
            success: false, 
            message: t(result.code, result.metadata),
            metadata: result.metadata
        };
    }

    // Update the cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<{ places_occupied?: number }>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { 
            ...cachedMatch.data, 
            places_occupied: action === 'join' 
                ? (cachedMatch.data.places_occupied || 0) + 1 
                : Math.max((cachedMatch.data.places_occupied || 0) - 1, 0)
        };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { 
        success: result.success, 
        message: t(result.code, result.metadata),
        metadata: result.metadata 
    };
}

/*

OUR RPC SUPABASE FUNCTIONS

CREATE OR REPLACE FUNCTION manage_player(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_user_id UUID,
    p_team_number INT,
    p_action TEXT
) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_current_time TIMESTAMP;
    v_ten_hours_before_match TIMESTAMP;
    v_updated_places_occupied INT;
    v_current_team_number INT;
BEGIN
    -- Fetch match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_ten_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '10 hours';
    v_updated_places_occupied := COALESCE(v_match.places_occupied, 0);

    -- Check if it's too late to leave
    IF p_action = 'leave' AND v_current_time > v_ten_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    -- Perform action
    CASE p_action
        WHEN 'join' THEN
            INSERT INTO match_players (match_id, user_id, team_number)
            VALUES (p_match_id, p_user_id, p_team_number);
            v_updated_places_occupied := v_updated_places_occupied + 1;

        WHEN 'leave' THEN
            DELETE FROM match_players
            WHERE match_id = p_match_id AND user_id = p_user_id;
            v_updated_places_occupied := GREATEST(v_updated_places_occupied - 1, 0);

        WHEN 'requestSubstitute' THEN
            UPDATE match_players
            SET substitute_requested = true
            WHERE match_id = p_match_id AND user_id = p_user_id;

        WHEN 'replacePlayer' THEN
            DELETE FROM match_players
            WHERE match_id = p_match_id AND user_id = p_user_id;

            INSERT INTO match_players (match_id, user_id, team_number)
            VALUES (p_match_id, p_auth_user_id, p_team_number);

        WHEN 'switchTeam' THEN
            SELECT team_number INTO v_current_team_number
            FROM match_players
            WHERE match_id = p_match_id AND user_id = p_user_id;

            UPDATE match_players
            SET team_number = CASE WHEN v_current_team_number = 1 THEN 2 ELSE 1 END
            WHERE match_id = p_match_id AND user_id = p_user_id;

        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INVALID_ACTION');
    END CASE;

    -- Update places_occupied in matches table
    UPDATE matches
    SET places_occupied = v_updated_places_occupied
    WHERE id = p_match_id;

    -- Return success message
    RETURN jsonb_build_object('success', true, 'code', 
        CASE p_action
            WHEN 'join' THEN 'PLAYER_JOINED_SUCCESSFULLY'
            WHEN 'leave' THEN 'PLAYER_LEFT_SUCCESSFULLY'
            WHEN 'requestSubstitute' THEN 'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
            WHEN 'switchTeam' THEN 'PLAYER_SWITCHED_TEAM_SUCCESSFULLY'
            WHEN 'replacePlayer' THEN 'PLAYER_REPLACED_SUCCESSFULLY'
            ELSE 'OPERATION_SUCCESSFUL'
        END
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNEXPECTED_ERROR');
END;
$$ LANGUAGE plpgsql;

*/