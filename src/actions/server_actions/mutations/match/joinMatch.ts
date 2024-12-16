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

export async function joinMatch(authToken: string, matchId: string, teamNumber: 0 | 1 | 2, withBalance: boolean) {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
            
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: t('MATCH_ID_INVALID') };
    }

    const { data, error } = await supabase.rpc('join_team', {
        p_auth_user_id: userId,
        p_match_id: matchId,
        p_user_id: userId,
        p_team_number: teamNumber,
        p_with_balance: withBalance
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        if (result.code === 'INSUFFICIENT_BALANCE') {
            return { success: false, message: t("INSUFFICIENT_BALANCE_TRY_CASH") };
        }
        return { success: false, message: t("PLAYER_JOIN_FAILED") };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedMatch = await upstashRedisCacheService.get<any>(matchCacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedPlacesOccupied = cachedMatch.data.places_occupied + 1;
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(matchCacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: t("PLAYER_JOINED_SUCCESSFULLY") };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION join_team(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_user_id UUID,
    p_team_number INT,
    p_with_balance BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_updated_places_occupied INT;
    v_updated_balance NUMERIC;
    v_has_paid BOOLEAN;
    v_has_entered_with_balance BOOLEAN;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    v_updated_places_occupied := COALESCE(v_match.places_occupied, 0) + 1;

    IF p_with_balance THEN
        IF v_user.balance >= v_match.price::numeric THEN
            UPDATE users
            SET balance = balance - v_match.price::numeric
            WHERE id = p_user_id
            RETURNING balance INTO v_updated_balance;

            v_has_paid := true;
            v_has_entered_with_balance := true;
        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_BALANCE');
        END IF;
    ELSE
        v_has_paid := false;
        v_has_entered_with_balance := false;
        v_updated_balance := v_user.balance;
    END IF;

    INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
    VALUES (p_match_id, p_user_id, p_team_number, v_has_paid, v_has_entered_with_balance);

    UPDATE matches
    SET places_occupied = v_updated_places_occupied
    WHERE id = p_match_id;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_JOINED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'has_paid', v_has_paid,
            'has_entered_with_balance', v_has_entered_with_balance,
            'updated_balance', v_updated_balance
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
            'context', 'join_team function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION join_team(UUID, UUID, UUID, INT, BOOLEAN) TO anon, authenticated;

*/