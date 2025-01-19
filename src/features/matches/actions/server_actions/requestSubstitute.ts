"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface RequestSubstituteResponse {
    success: boolean;
    message: string;
}

interface RequestSubstituteParams {
    matchIdFromParams: string;
    matchPlayerId: string;
    playerType: 'regular' | 'temporary';
}

export async function requestSubstitute({
    matchIdFromParams,
    matchPlayerId,
    playerType
}: RequestSubstituteParams): Promise<RequestSubstituteResponse> {
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

    const { data, error } = await supabase.rpc('request_substitute', {
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
            message: t('SUBSTITUTE_REQUEST_FAILED'),
        };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t(playerType === 'temporary' ? 
            'TEMPORARY_PLAYER_SUBSTITUTE_REQUESTED' : 
            'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
        )
    };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION request_substitute(
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
    v_match_start TIMESTAMP;
BEGIN
    -- Get match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get player requesting substitute
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
            RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED_TO_REQUEST');
        END IF;
    ELSE
        -- For regular players, verify it's their own record
        IF v_player.user_id != p_auth_user_id THEN
            RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED_TO_REQUEST');
        END IF;
    END IF;

    -- Update the player's substitute request status
    UPDATE match_players
    SET substitute_requested = true
    WHERE id = p_match_player_id;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
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