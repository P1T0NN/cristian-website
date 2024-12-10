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
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function addFriend(authToken: string, matchId: string, teamNumber: 0 | 1 | 2, friendName: string, phoneNumber: string) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload || typeof payload.sub !== 'string') {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const userId = payload.sub;

    const { data, error } = await supabase.rpc('add_temporary_player', {
        p_user_id: userId,
        p_match_id: matchId,
        p_team_number: teamNumber,
        p_friend_name: friendName,
        p_phone_number: phoneNumber
    });

    const result = data as RPCResponseData;

    if (error) {
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
            places_occupied: (cachedMatch.data.places_occupied || 0) + 1
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

OUR SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION add_temporary_player(
    p_user_id UUID,
    p_match_id UUID,
    p_team_number INT,
    p_friend_name TEXT,
    p_phone_number TEXT
) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_updated_places_occupied INT;
    v_temp_player RECORD;
BEGIN
    -- Fetch match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Fetch user details
    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    v_updated_places_occupied := COALESCE(v_match.places_occupied, 0) + 1;

    -- Insert temporary player
    BEGIN
        INSERT INTO temporary_players (match_id, team_number, name, added_by, added_by_name, phone_number)
        VALUES (p_match_id, p_team_number, p_friend_name, p_user_id, v_user."fullName", p_phone_number)
        RETURNING * INTO v_temp_player;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'INSERT_FAILED', 'details', SQLERRM);
    END;

    -- Update places_occupied in matches table
    BEGIN
        UPDATE matches
        SET places_occupied = v_updated_places_occupied
        WHERE id = p_match_id;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UPDATE_FAILED', 'details', SQLERRM);
    END;

    -- Update has_added_friend in match_players table
    BEGIN
        UPDATE match_players
        SET has_added_friend = true
        WHERE match_id = p_match_id AND user_id = p_user_id;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UPDATE_FAILED', 'details', SQLERRM);
    END;

    -- Return success message
    RETURN jsonb_build_object('success', true, 'code', 'FRIEND_ADDED_SUCCESSFULLY', 'data', row_to_json(v_temp_player));

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNEXPECTED_ERROR', 'details', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/