"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface ReplacePlayerResponse {
    success: boolean;
    message: string;
}

interface ReplacePlayerParams {
    matchIdFromParams: string;
    playerToReplaceId: string;
    withBalance: boolean;
}

export const replacePlayer = async ({
    matchIdFromParams,
    playerToReplaceId,
    withBalance
}: ReplacePlayerParams): Promise<ReplacePlayerResponse> => {
    console.log('Starting replacePlayer with params:', {
        matchIdFromParams,
        playerToReplaceId,
        withBalance
    });

    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth();
    console.log('Auth check result:', { isAuth, authUserId });
                
    if (!isAuth) {
        console.log('Auth failed');
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !playerToReplaceId) {
        console.log('Missing required params:', { matchIdFromParams, playerToReplaceId });
        return { success: false, message: t('BAD_REQUEST') };
    }

    console.log('Calling replace_player RPC with params:', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_match_player_id: playerToReplaceId,
        p_with_balance: withBalance
    });

    const { data, error } = await supabase.rpc('replace_player', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_match_player_id: playerToReplaceId,
        p_with_balance: withBalance
    });

    if (error) {
        console.error('RPC error:', error);
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    console.log('RPC response:', data);

    if (!data.success) {
        console.log('Replace failed with code:', data.code);
        if (data.code === 'INSUFFICIENT_BALANCE') {
            return { success: false, message: t("INSUFFICIENT_BALANCE_TRY_CASH") };
        }
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    console.log('Replace successful, revalidating paths');
    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { 
        success: true, 
        message: t('PLAYER_REPLACED_SUCCESSFULLY')
    };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION replace_player(
    p_auth_user_id TEXT,
    p_match_id UUID,
    p_match_player_id TEXT,
    p_with_balance BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_user RECORD;
    v_current_time TIMESTAMP;
    v_match_start TIMESTAMP;
    v_match_price DECIMAL;
    v_updated_balance NUMERIC;
    v_player_name TEXT;
BEGIN
    RAISE LOG 'Starting replace_player with params: auth_user=%, match=%, player=%, with_balance=%',
        p_auth_user_id, p_match_id, p_match_player_id, p_with_balance;

    -- Get match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get player requesting substitute
    SELECT * INTO v_player 
    FROM match_players 
    WHERE id = p_match_player_id
    AND "matchId" = p_match_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    -- Get user details for balance check and info
    SELECT * INTO v_user FROM "user" WHERE id = p_auth_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    -- Store user info
    v_player_name := v_user.name;

    -- Check time limit
    v_current_time := CURRENT_TIMESTAMP;
    v_match_start := (v_match."startsAtDay" || ' ' || v_match."startsAtHour")::TIMESTAMP;
    
    IF v_current_time > v_match_start THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_ALREADY_STARTED');
    END IF;

    -- Handle balance payment for new player
    IF p_with_balance THEN
        IF v_user.balance >= v_match.price::numeric THEN
            -- Deduct balance from new player
            UPDATE "user"
            SET balance = balance - v_match.price::numeric
            WHERE id = p_auth_user_id
            RETURNING balance INTO v_updated_balance;
        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_BALANCE');
        END IF;
    END IF;

    -- Update the player record with the new player
    UPDATE match_players
    SET "userId" = p_auth_user_id,
        "substituteRequested" = false,
        "playerType" = 'regular',
        "hasEnteredWithBalance" = p_with_balance
    WHERE id = p_match_player_id;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PLAYER_REPLACED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'playerId', p_match_player_id,
            'playerName', v_player_name,
            'playerPosition', v_user."playerPosition",
            'hasEnteredWithBalance', p_with_balance,
            'updatedBalance', CASE 
                WHEN p_with_balance THEN v_updated_balance
                ELSE NULL
            END
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Unexpected error in replace_player: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION replace_player(TEXT, UUID, TEXT, BOOLEAN) TO authenticated;

*/