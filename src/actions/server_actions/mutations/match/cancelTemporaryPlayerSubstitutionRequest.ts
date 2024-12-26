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

interface CancelTemporaryPlayerSubstitutionRequestResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface CancelTemporaryPlayerSubstitutionRequestParams {
    matchIdFromParams: string;
    temporaryPlayerId: string;
}

export async function cancelTemporaryPlayerSubstitutionRequest({
    matchIdFromParams,
    temporaryPlayerId
}: CancelTemporaryPlayerSubstitutionRequestParams): Promise<CancelTemporaryPlayerSubstitutionRequestResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !temporaryPlayerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('cancel_temporary_player_substitution_request', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_temporary_player_id: temporaryPlayerId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('CANCEL_TEMPORARY_PLAYER_SUBSTITUTION_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    await upstashRedisCacheService.delete(matchCacheKey);

    revalidatePath("/");

    return { success: true, message: t("TEMPORARY_PLAYER_SUBSTITUTION_REQUEST_CANCELED"), metadata: data };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION cancel_temporary_player_substitution_request(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_temporary_player_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_temporary_player RECORD;
BEGIN
    -- Check if the temporary player exists and has requested a substitute
    SELECT * INTO v_temporary_player 
    FROM temporary_players 
    WHERE id = p_temporary_player_id AND match_id = p_match_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
    END IF;

    IF NOT v_temporary_player.substitute_requested THEN
        RETURN jsonb_build_object('success', false, 'code', 'NO_SUBSTITUTE_REQUESTED');
    END IF;

    -- Cancel the substitution request
    UPDATE temporary_players
    SET substitute_requested = false
    WHERE id = p_temporary_player_id AND match_id = p_match_id;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'TEMPORARY_PLAYER_SUBSTITUTION_REQUEST_CANCELED',
        'metadata', jsonb_build_object(
            'matchId', p_match_id,
            'temporaryPlayerId', p_temporary_player_id
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
            'context', 'cancel_temporary_player_substitution_request function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_temporary_player_substitution_request(UUID, UUID, UUID) TO anon, authenticated;

*/