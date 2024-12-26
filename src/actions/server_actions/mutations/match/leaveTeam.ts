"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';
import type { typesMatch } from '@/types/typesMatch';

interface LeaveMatchResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface LeaveMatchParams {
    matchIdFromParams: string;
}

export async function leaveMatch({
    matchIdFromParams
}: LeaveMatchParams): Promise<LeaveMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('leave_match', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('PLAYER_LEAVE_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    const cachedMatch = await upstashRedisCacheService.get<typesMatch>(matchCacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedPlacesOccupied = Math.max((cachedMatch.data.places_occupied || 0) - 1, 0);
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(matchCacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: t("PLAYER_LEFT_SUCCESSFULLY"), metadata: data };
}

/* SUPABASE RPC FUNCTION 

CREATE OR REPLACE FUNCTION leave_match(
    p_auth_user_id UUID,
    p_match_id UUID
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
    v_updated_balance NUMERIC;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_player FROM match_players WHERE match_id = p_match_id AND user_id = p_auth_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

    IF v_current_time > v_eight_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    -- Refund the player if they paid
    IF v_player.has_entered_with_balance THEN
        UPDATE users
        SET balance = balance + v_match.price::numeric
        WHERE id = p_auth_user_id
        RETURNING balance INTO v_updated_balance;
    END IF;

    -- Remove the player from the match
    DELETE FROM match_players
    WHERE match_id = p_match_id AND user_id = p_auth_user_id;

    -- Update the places occupied
    UPDATE matches
    SET places_occupied = places_occupied - 1
    WHERE id = p_match_id
    RETURNING places_occupied INTO v_updated_places_occupied;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_LEFT_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_balance', v_updated_balance,
            'updated_places_occupied', v_updated_places_occupied
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
            'context', 'leave_match function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION leave_match(UUID, UUID) TO anon, authenticated;

*/