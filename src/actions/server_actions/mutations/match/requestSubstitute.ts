"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

interface RequestSubstituteResponse {
    success: boolean;
    message: string;
}

interface RequestSubstituteParams {
    matchIdFromParams: string;
}

export async function requestSubstitute({
    matchIdFromParams
}: RequestSubstituteParams): Promise<RequestSubstituteResponse> {
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

    const { data, error } = await supabase.rpc('request_substitute', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('SUBSTITUTE_REQUEST_FAILED')};
    }

    revalidatePath("/");

    return { success: true, message: t('SUBSTITUTE_REQUESTED_SUCCESSFULLY')};
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION request_temporary_player_substitute(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_temporary_player_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_temporary_player RECORD;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_temporary_player FROM temporary_players WHERE id = p_temporary_player_id AND match_id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
    END IF;

    IF v_temporary_player.substitute_requested THEN
        RETURN jsonb_build_object('success', false, 'code', 'SUBSTITUTE_ALREADY_REQUESTED');
    END IF;

    -- Update the temporary player's substitute_requested status
    UPDATE temporary_players
    SET substitute_requested = true
    WHERE id = p_temporary_player_id AND match_id = p_match_id;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'SUBSTITUTE_REQUESTED_SUCCESSFULLY',
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
            'context', 'request_temporary_player_substitute function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION request_temporary_player_substitute(UUID, UUID, UUID) TO anon, authenticated;

*/