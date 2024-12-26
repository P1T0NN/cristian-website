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

interface CancelSubstitutionRequestResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface CancelSubstitutionRequestParams {
    matchIdFromParams: string;
}

export async function cancelSubstitutionRequest({
    matchIdFromParams
}: CancelSubstitutionRequestParams): Promise<CancelSubstitutionRequestResponse> {
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

    const { data, error } = await supabase.rpc('cancel_substitution_request', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('CANCEL_SUBSTITUTION_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    await upstashRedisCacheService.delete(matchCacheKey);

    revalidatePath("/");

    return { success: true, message: t("SUBSTITUTION_REQUEST_CANCELED"), metadata: data };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION cancel_substitution_request(
    p_auth_user_id UUID,
    p_match_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match_player RECORD;
BEGIN
    -- Check if the player is in the match and has requested a substitute
    SELECT * INTO v_match_player 
    FROM match_players 
    WHERE match_id = p_match_id AND user_id = p_auth_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    IF NOT v_match_player.substitute_requested THEN
        RETURN jsonb_build_object('success', false, 'code', 'NO_SUBSTITUTE_REQUESTED');
    END IF;

    -- Cancel the substitution request
    UPDATE match_players
    SET substitute_requested = false
    WHERE match_id = p_match_id AND user_id = p_auth_user_id;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'SUBSTITUTION_REQUEST_CANCELED',
        'metadata', jsonb_build_object(
            'matchId', p_match_id,
            'userId', p_auth_user_id
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
            'context', 'cancel_substitution_request function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_substitution_request(UUID, UUID) TO anon, authenticated;

*/