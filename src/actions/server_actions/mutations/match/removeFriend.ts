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
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function removeFriend(authToken: string, matchId: string, temporaryPlayerId: string) {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: t('MATCH_ID_INVALID') };
    }

    const { data, error } = await supabase.rpc('remove_temporary_player', {
        p_user_id: authUserId,
        p_match_id: matchId,
        p_temporary_player_id: temporaryPlayerId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: t('FRIEND_REMOVE_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
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

    return { success: true, message: t("FRIEND_REMOVED_SUCCESSFULLY"), metadata: result.metadata };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION remove_temporary_player(
    p_user_id UUID,
    p_match_id UUID,
    p_temporary_player_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_temp_player RECORD;
    v_current_time TIMESTAMP;
    v_eight_hours_before_match TIMESTAMP;
    v_updated_places_occupied INT;
    v_remaining_friends INT;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_temp_player FROM temporary_players 
    WHERE id = p_temporary_player_id AND match_id = p_match_id AND added_by = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

    IF v_current_time > v_eight_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_REMOVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    -- Remove the temporary player
    DELETE FROM temporary_players
    WHERE id = p_temporary_player_id AND match_id = p_match_id AND added_by = p_user_id;

    -- Update the places occupied
    UPDATE matches
    SET places_occupied = places_occupied - 1
    WHERE id = p_match_id
    RETURNING places_occupied INTO v_updated_places_occupied;

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

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'FRIEND_REMOVED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_places_occupied', v_updated_places_occupied,
            'remaining_friends', v_remaining_friends
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR', 
            'message', SQLERRM,
            'sqlstate', SQLSTATE,
            'detail', COALESCE(SQLERRM, 'Unknown error'),
            'context', 'remove_temporary_player function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION remove_temporary_player(UUID, UUID, UUID) TO anon, authenticated;

*/