"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesMatch } from '../../types/typesMatch';

interface RemovePlayerResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface RemovePlayerParams {
    matchIdFromParams: string;
    playerId: string;
    playerType: 'regular' | 'temporary';
    isAdmin?: boolean;
}

export async function removePlayer({
    matchIdFromParams,
    playerId,
    playerType,
    isAdmin
}: RemovePlayerParams): Promise<RemovePlayerResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !playerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Pass isAdmin to the RPC function
    const { data, error } = await supabase.rpc('remove_match_player', {
        p_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_player_id: playerId,
        p_player_type: playerType,
        p_is_admin: isAdmin
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        // Handle specific error codes
        if (data.code === 'TOO_LATE_TO_REMOVE') {
            return { 
                success: false, 
                message: t('TOO_LATE_TO_REMOVE'),
                metadata: data.metadata 
            };
        }
        return { success: false, message: t('PLAYER_REMOVE_FAILED') };
    }

    // Update the match cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    const cachedMatch = await upstashRedisCacheService.get<typesMatch>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { 
            ...cachedMatch.data, 
            places_occupied: Math.max((cachedMatch.data.places_occupied || 0) - 1, 0)
        };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12);
    }

    revalidatePath("/");

    const messageKey = playerType === 'temporary' ? 
        "TEMPORARY_PLAYER_REMOVED_SUCCESSFULLY" : 
        "PLAYER_REMOVED_SUCCESSFULLY";

    return { success: true, message: t(messageKey) };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION remove_match_player(
    p_user_id UUID,
    p_match_id UUID,
    p_player_id UUID,
    p_player_type TEXT,
    p_is_admin BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_current_time TIMESTAMP;
    v_eight_hours_before_match TIMESTAMP;
    v_updated_places_occupied INT;
    v_match_price DECIMAL;
BEGIN
    -- Fetch match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Check timing only if not admin
    IF NOT p_is_admin THEN
        v_current_time := CURRENT_TIMESTAMP;
        v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

        IF v_current_time > v_eight_hours_before_match THEN
            RETURN jsonb_build_object(
                'success', false, 
                'code', 'TOO_LATE_TO_REMOVE', 
                'metadata', jsonb_build_object('canRequestSubstitute', true)
            );
        END IF;
    END IF;

    -- Get player details before removal
    SELECT mp.*, m.price 
    INTO v_player 
    FROM match_players mp
    JOIN matches m ON m.id = mp.match_id
    WHERE mp.id = p_player_id 
    AND mp.match_id = p_match_id;

    -- Only restore balance if player entered with balance
    IF v_player.has_entered_with_balance = true THEN
        -- Restore balance to user
        UPDATE users 
        SET balance = balance + v_player.price
        WHERE id = v_player.user_id;
    END IF;

    -- Remove player (admins can remove any player)
    DELETE FROM match_players
    WHERE id = p_player_id 
    AND match_id = p_match_id
    AND (p_is_admin OR user_id = p_user_id);

    -- Update places_occupied
    UPDATE matches
    SET places_occupied = GREATEST(places_occupied - 1, 0)
    WHERE id = p_match_id
    RETURNING places_occupied INTO v_updated_places_occupied;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PLAYER_REMOVED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_places_occupied', v_updated_places_occupied,
            'balance_restored', v_player.has_entered_with_balance,
            'restored_amount', CASE WHEN v_player.has_entered_with_balance THEN v_player.price ELSE 0 END
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

*/
