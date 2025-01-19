"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
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
    matchPlayerId: string;
    teamNumber: number;
    withBalance: boolean;
}

export async function replacePlayer({
    matchIdFromParams,
    matchPlayerId,
    teamNumber,
    withBalance
}: ReplacePlayerParams): Promise<ReplacePlayerResponse> {
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

    const { data, error } = await supabase.rpc('replace_player', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_match_player_id: matchPlayerId,
        p_team_number: teamNumber,
        p_with_balance: withBalance
    });

    if (error) {
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    if (!data.success) {
        if (data.code === 'INSUFFICIENT_BALANCE') {
            return { success: false, message: t("INSUFFICIENT_BALANCE_TRY_CASH") };
        }
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t('PLAYER_REPLACED_SUCCESSFULLY') };
}

/*

CREATE OR REPLACE FUNCTION replace_player(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_match_player_id UUID,
    p_team_number INTEGER,
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
    v_original_adder_id UUID;
    v_match_price DECIMAL;
    v_updated_balance NUMERIC;
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

    -- Check if player has requested a substitute
    IF NOT v_player.substitute_requested THEN
        RETURN jsonb_build_object('success', false, 'code', 'NO_SUBSTITUTE_REQUESTED');
    END IF;

    -- Check if auth user is not the same as the player being replaced
    IF v_player.user_id = p_auth_user_id THEN
        RETURN jsonb_build_object('success', false, 'code', 'CANNOT_REPLACE_SELF');
    END IF;

    -- Check if match hasn't started yet
    v_current_time := CURRENT_TIMESTAMP;
    v_match_start := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP;
    
    IF v_current_time > v_match_start THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_ALREADY_STARTED');
    END IF;

    -- Get user details for balance check
    SELECT * INTO v_user FROM users WHERE id = p_auth_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    -- Handle balance payment for new player
    IF p_with_balance THEN
        IF v_user.balance >= v_match.price::numeric THEN
            -- Deduct balance from new player
            UPDATE users
            SET balance = balance - v_match.price::numeric
            WHERE id = p_auth_user_id
            RETURNING balance INTO v_updated_balance;
        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_BALANCE');
        END IF;
    END IF;

    -- If this is a temporary player, store the ID of the player who added them
    IF v_player.player_type = 'temporary' THEN
        v_original_adder_id := v_player.user_id;
    ELSE
        -- For regular players, check if they entered with balance and restore it
        IF v_player.has_entered_with_balance THEN
            v_match_price := v_match.price;
            
            -- Restore balance to the original player
            UPDATE users
            SET balance = balance + v_match_price
            WHERE id = v_player.user_id;
        END IF;
    END IF;

    -- Update the player record with the new player
    UPDATE match_players
    SET user_id = p_auth_user_id,
        substitute_requested = false,
        player_type = 'regular',
        has_entered_with_balance = p_with_balance
    WHERE id = p_match_player_id;

    -- If this was a temporary player, reset has_added_friend for the original adder
    IF v_player.player_type = 'temporary' THEN
        UPDATE match_players
        SET has_added_friend = false
        WHERE match_id = p_match_id 
        AND user_id = v_original_adder_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PLAYER_REPLACED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'team_number', p_team_number,
            'was_temporary', v_player.player_type = 'temporary',
            'original_adder_id', v_original_adder_id,
            'balance_restored', CASE 
                WHEN v_player.player_type = 'regular' AND v_player.has_entered_with_balance THEN v_match_price
                ELSE 0
            END,
            'updated_balance', CASE 
                WHEN p_with_balance THEN v_updated_balance
                ELSE NULL
            END
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'REPLACEMENT_FAILED',
            'message', SQLERRM
        );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION replace_player(UUID, UUID, UUID, INTEGER, BOOLEAN) TO anon, authenticated;

*/