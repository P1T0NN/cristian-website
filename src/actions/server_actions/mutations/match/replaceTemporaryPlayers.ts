"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function replaceTemporaryPlayer(authToken: string, matchId: string, temporaryPlayerId: string, teamNumber: number) {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId || !temporaryPlayerId || !teamNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('replace_temporary_player', {
        p_auth_user_id: authUserId,
        p_match_id: matchId,
        p_temporary_player_id: temporaryPlayerId,
        p_team_number: teamNumber
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t('PLAYER_REPLACED_SUCCESSFULLY') };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION replace_temporary_player(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_temporary_player_id UUID,
    p_team_number INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_temporary_player RECORD;
    v_updated_balance NUMERIC;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_auth_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    -- Check if the temporary player exists and get the user who added them
    SELECT * INTO v_temporary_player 
    FROM temporary_players 
    WHERE id = p_temporary_player_id AND match_id = p_match_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'TEMPORARY_PLAYER_NOT_FOUND');
    END IF;

    -- Remove the temporary player
    DELETE FROM temporary_players
    WHERE id = p_temporary_player_id AND match_id = p_match_id;

    -- Update has_added_friend to false for the player who added the temporary player
    UPDATE match_players
    SET has_added_friend = false
    WHERE match_id = p_match_id AND user_id = v_temporary_player.added_by;

    -- Check the balance of the user who is replacing
    SELECT balance INTO v_updated_balance FROM users WHERE id = p_auth_user_id;

    -- Add the new player
    IF v_updated_balance >= v_match.price::numeric THEN
        UPDATE users
        SET balance = balance - v_match.price::numeric
        WHERE id = p_auth_user_id
        RETURNING balance INTO v_updated_balance;

        INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
        VALUES (p_match_id, p_auth_user_id, p_team_number, true, true);
    ELSE
        INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
        VALUES (p_match_id, p_auth_user_id, p_team_number, false, false);
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'TEMPORARY_PLAYER_REPLACED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'has_paid', v_updated_balance >= v_match.price::numeric,
            'has_entered_with_balance', v_updated_balance >= v_match.price::numeric,
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
            'context', 'replace_temporary_player function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION replace_temporary_player(UUID, UUID, UUID, INT) TO anon, authenticated;

*/