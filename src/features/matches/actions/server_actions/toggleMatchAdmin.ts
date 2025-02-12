"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface ToggleMatchAdminResponse {
    success: boolean;
    message: string;
}

interface ToggleMatchAdminParams {
    matchPlayerId: string;
    matchIdFromParams: string;
    isMatchAdmin: boolean;
}

export const toggleMatchAdmin = async ({
    matchPlayerId,
    matchIdFromParams,
    isMatchAdmin
}: ToggleMatchAdminParams): Promise<ToggleMatchAdminResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth();
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { data, error } = await supabase.rpc('toggle_match_admin', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_match_player_id: matchPlayerId,
        p_is_match_admin: isMatchAdmin
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { success: false, message: t('TOGGLE_MATCH_ADMIN_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: isMatchAdmin ? t('MATCH_ADMIN_ADDED') : t('MATCH_ADMIN_REMOVED')
    };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION toggle_match_admin(
    p_auth_user_id TEXT,
    p_match_id UUID,
    p_match_player_id TEXT,
    p_is_match_admin BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_user RECORD;
    v_player_name TEXT;
BEGIN
    RAISE LOG 'Starting toggle_match_admin with params: auth_user=%, match=%, player=%, is_admin=%',
        p_auth_user_id, p_match_id, p_match_player_id, p_is_match_admin;

    -- Verify admin permissions (using isAdmin from user table)
    SELECT "isAdmin" INTO v_user FROM "user" WHERE id = p_auth_user_id;
    IF NOT FOUND OR NOT v_user."isAdmin" THEN
        RAISE LOG 'User not found or not admin: %', p_auth_user_id;
        RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED');
    END IF;

    -- Get match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RAISE LOG 'Match not found: %', p_match_id;
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get player details
    SELECT mp.*, u.name as player_name 
    INTO v_player 
    FROM match_players mp
    JOIN "user" u ON u.id = mp."userId"
    WHERE mp.id = p_match_player_id
    AND mp."matchId" = p_match_id;

    IF NOT FOUND THEN
        RAISE LOG 'Player not found in match: player_id=%, match_id=%', 
            p_match_player_id, p_match_id;
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    RAISE LOG 'Found player: %', to_json(v_player);

    -- Store player name
    v_player_name := v_player.player_name;

    -- Update match_players hasMatchAdmin status
    UPDATE match_players
    SET "hasMatchAdmin" = p_is_match_admin
    WHERE id = p_match_player_id;

    RAISE LOG 'Updated match_players hasMatchAdmin to %', p_is_match_admin;

    -- If setting as match admin, update matches table addedBy
    IF p_is_match_admin THEN
        UPDATE matches
        SET "addedBy" = v_player_name
        WHERE id = p_match_id;
        
        RAISE LOG 'Updated matches addedBy to %', v_player_name;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'code', CASE 
            WHEN p_is_match_admin THEN 'MATCH_ADMIN_ADDED'
            ELSE 'MATCH_ADMIN_REMOVED'
        END
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Unexpected error in toggle_match_admin: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_match_admin(TEXT, UUID, TEXT, BOOLEAN) TO authenticated;

*/