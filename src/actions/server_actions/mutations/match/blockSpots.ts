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

export async function blockSpots(
    authToken: string,
    matchId: string,
    teamNumber: 1 | 2,
    spotsToBlock: number
) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !teamNumber || typeof spotsToBlock !== 'number') {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('block_spots', {
        p_user_id: userId,
        p_match_id: matchId,
        p_team_number: teamNumber,
        p_spots_to_block: spotsToBlock
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: genericMessages('SPOTS_BLOCK_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<{ places_occupied?: number, block_spots_team1?: number, block_spots_team2?: number }>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { 
            ...cachedMatch.data, 
            places_occupied: result.metadata?.updated_places_occupied,
            [`block_spots_team${teamNumber}`]: spotsToBlock
        };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('SPOTS_BLOCKED_SUCCESSFULLY'), metadata: result.metadata };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION block_spots(
    p_user_id UUID,
    p_match_id UUID,
    p_team_number INT,
    p_spots_to_block INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_is_admin BOOLEAN;
    v_current_blocked_spots INT;
    v_updated_places_occupied INT;
    v_spots_difference INT;
BEGIN
    -- Check if the user is an admin
    SELECT "isAdmin" INTO v_is_admin FROM users WHERE id = p_user_id;
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED');
    END IF;

    -- Get the current match data
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get the current blocked spots
    IF p_team_number = 1 THEN
        v_current_blocked_spots := COALESCE(v_match.block_spots_team1, 0);
    ELSE
        v_current_blocked_spots := COALESCE(v_match.block_spots_team2, 0);
    END IF;

    -- Calculate the difference in blocked spots
    v_spots_difference := p_spots_to_block - v_current_blocked_spots;

    -- Update places_occupied
    v_updated_places_occupied := GREATEST(0, COALESCE(v_match.places_occupied, 0) + v_spots_difference);

    -- Update the blocked spots and places_occupied
    IF p_team_number = 1 THEN
        UPDATE matches 
        SET block_spots_team1 = p_spots_to_block, places_occupied = v_updated_places_occupied
        WHERE id = p_match_id;
    ELSE
        UPDATE matches 
        SET block_spots_team2 = p_spots_to_block, places_occupied = v_updated_places_occupied
        WHERE id = p_match_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'SPOTS_BLOCKED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_places_occupied', v_updated_places_occupied,
            'blocked_spots', p_spots_to_block
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
            'context', 'block_spots function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION block_spots(UUID, UUID, INT, INT) TO anon, authenticated;

*/