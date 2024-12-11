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

export async function removeFriend(authToken: string, matchId: string, temporaryPlayerId: string) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload || typeof payload.sub !== 'string') {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const userId = payload.sub;

    // Check if the user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (userError) {
        return { success: false, message: t('USER_FETCH_ERROR') };
    }

    const isAdmin = userData.isAdmin;

    const { data, error } = await supabase.rpc('remove_temporary_player', {
        p_user_id: userId,
        p_match_id: matchId,
        p_temporary_player_id: temporaryPlayerId,
        p_is_admin: isAdmin
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED'), metadata: { error: error.message } };
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
            places_occupied: Math.max((cachedMatch.data.places_occupied || 0) - 1, 0)
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

CREATE OR REPLACE FUNCTION remove_temporary_player(
    p_user_id UUID,
    p_match_id UUID,
    p_temporary_player_id UUID,
    p_is_admin BOOLEAN
) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_temp_player RECORD;
    v_updated_places_occupied INT;
    v_remaining_friends INT;
    v_current_time TIMESTAMP;
    v_eight_hours_before_match TIMESTAMP;
BEGIN
    -- Fetch match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Calculate time variables
    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

    -- Check if it's after 8 hours before the match
    IF v_current_time > v_eight_hours_before_match AND NOT p_is_admin THEN
        -- Update temporary player to request substitute
        UPDATE temporary_players
        SET substitute_requested = true
        WHERE id = p_temporary_player_id AND match_id = p_match_id AND added_by = p_user_id
        RETURNING * INTO v_temp_player;

        IF FOUND THEN
            RETURN jsonb_build_object('success', true, 'code', 'SUBSTITUTE_REQUESTED', 'canRequestSubstitute', true);
        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
        END IF;
    END IF;

    -- Proceed with removal (either before 8 hours or if user is admin)
    IF p_is_admin THEN
        -- If user is admin, allow removal of any temporary player
        DELETE FROM temporary_players
        WHERE id = p_temporary_player_id AND match_id = p_match_id
        RETURNING * INTO v_temp_player;
    ELSE
        -- If user is not admin, only allow removal if they added the player
        DELETE FROM temporary_players
        WHERE id = p_temporary_player_id AND match_id = p_match_id AND added_by = p_user_id
        RETURNING * INTO v_temp_player;
    END IF;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
    END IF;

    v_updated_places_occupied := GREATEST(COALESCE(v_match.places_occupied, 0) - 1, 0);

    -- Update places_occupied in matches table
    UPDATE matches
    SET places_occupied = v_updated_places_occupied
    WHERE id = p_match_id;

    -- Check if the user has any remaining friends in this match
    SELECT COUNT(*) INTO v_remaining_friends
    FROM temporary_players
    WHERE match_id = p_match_id AND added_by = p_user_id;

    -- If no remaining friends, set has_added_friend to false
    IF v_remaining_friends = 0 THEN
        UPDATE match_players
        SET has_added_friend = false
        WHERE match_id = p_match_id AND user_id = p_user_id;
    END IF;

    -- Return success message
    RETURN jsonb_build_object('success', true, 'code', 'FRIEND_REMOVED_SUCCESSFULLY');

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNEXPECTED_ERROR', 'details', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/