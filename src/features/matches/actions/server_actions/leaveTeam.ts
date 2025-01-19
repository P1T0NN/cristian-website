"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesMatch } from '../../types/typesMatch';

interface LeaveMatchMetadata {
    code?: string;
    metadata?: {
        canRequestSubstitute?: boolean;
        updated_balance?: number;
        updated_places_occupied?: number;
    };
}

interface LeaveMatchResponse {
    success: boolean;
    message: string;
    metadata?: LeaveMatchMetadata;
}

interface LeaveMatchParams {
    matchIdFromParams: string;
    matchPlayerId: string;
    playerType: "regular" | "temporary";
}

export async function leaveMatch({
    matchIdFromParams,
    matchPlayerId,
    playerType
}: LeaveMatchParams): Promise<LeaveMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !matchPlayerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('leave_match', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_match_player_id: matchPlayerId,
        p_is_temporary: playerType === 'temporary'
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { 
            success: false, 
            message: t('PLAYER_LEAVE_FAILED'), 
            metadata: data as LeaveMatchMetadata 
        };
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
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("PLAYER_LEFT_SUCCESSFULLY"), metadata: data };
}

/* SUPABASE RPC FUNCTION 

CREATE OR REPLACE FUNCTION leave_match(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_match_player_id UUID,
    p_is_temporary BOOLEAN
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
    -- Get match details first
    SELECT * INTO v_match 
    FROM matches 
    WHERE id = p_match_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get the player record using match_player_id
    SELECT * INTO v_player 
    FROM match_players 
    WHERE id = p_match_player_id
    AND match_id = p_match_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    -- Check authorization based on player_type
    IF v_player.player_type = 'temporary' THEN
        -- For temporary players, verify the auth user is the one who added them
        IF v_player.user_id != p_auth_user_id THEN
            RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED_TO_REMOVE');
        END IF;
    ELSE
        -- For regular players, verify it's their own record
        IF v_player.user_id != p_auth_user_id THEN
            RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED_TO_REMOVE');
        END IF;
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';

    IF v_current_time > v_eight_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    -- If player entered with balance, restore it
    IF v_player.has_entered_with_balance THEN
        -- Get match price
        v_match_price := v_match.price;
        
        -- Restore balance to user
        UPDATE users
        SET balance = balance + v_match_price
        WHERE id = v_player.user_id;
    END IF;

    -- Remove the player from the match
    DELETE FROM match_players
    WHERE id = p_match_player_id;

    -- Update the places occupied
    UPDATE matches
    SET places_occupied = places_occupied - 1
    WHERE id = p_match_id
    RETURNING places_occupied INTO v_updated_places_occupied;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_LEFT_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_places_occupied', v_updated_places_occupied,
            'balance_restored', CASE 
                WHEN v_player.has_entered_with_balance THEN v_match_price
                ELSE 0
            END
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR', 
            'message', SQLERRM
        );
END;
$$;

*/