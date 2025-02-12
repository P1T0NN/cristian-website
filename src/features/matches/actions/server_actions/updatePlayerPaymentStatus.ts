"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface UpdatePlayerPaymentStatusParams {
    matchIdFromParams: string;
    matchPlayerId: string;
    type: 'paid' | 'discount' | 'gratis';
    currentValue: boolean;
}

interface UpdatePlayerPaymentStatusResponse {
    success: boolean;
    message: string;
    metadata?: {
        hasPaid: boolean;
        hasDiscount: boolean;
        hasGratis: boolean;
    };
}

export const updatePlayerPaymentStatus = async ({
    matchIdFromParams,
    matchPlayerId,
    type,
    currentValue
}: UpdatePlayerPaymentStatusParams): Promise<UpdatePlayerPaymentStatusResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth } = await verifyAuth();

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { data, error } = await supabase.rpc('update_player_payment_status', {
        p_match_id: matchIdFromParams,
        p_player_id: matchPlayerId,
        p_type: type,
        p_current_value: currentValue
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { success: false, message: t('PLAYER_NOT_FOUND') };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);
    
    return { 
        success: true, 
        message: t('PAYMENT_STATUS_UPDATED_SUCCESSFULLY'),
        metadata: data.metadata
    };
}

/* SUPABASE RPC FUNCTION

DROP FUNCTION IF EXISTS update_player_payment_status(UUID, TEXT, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION update_player_payment_status(
    p_match_id UUID,
    p_player_id TEXT,
    p_type TEXT,
    p_current_value BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_player RECORD;
BEGIN
    -- Update the player's payment status based on type
    WITH updated AS (
        UPDATE match_players
        SET 
            "hasPaid" = CASE 
                WHEN p_type = 'paid' THEN NOT p_current_value
                WHEN p_type = 'gratis' AND NOT p_current_value THEN true  -- Auto set hasPaid when gratis is given
                ELSE "hasPaid"
            END,
            "hasDiscount" = CASE 
                WHEN p_type = 'discount' THEN NOT p_current_value
                WHEN p_type = 'gratis' AND NOT p_current_value THEN false  -- Reset discount when gratis is given
                ELSE "hasDiscount"
            END,
            "hasGratis" = CASE 
                WHEN p_type = 'gratis' THEN NOT p_current_value
                ELSE "hasGratis"
            END
        WHERE id = p_player_id 
        AND "matchId" = p_match_id
        RETURNING *
    )
    SELECT * INTO v_updated_player FROM updated;

    -- Check if player was found and updated
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'PLAYER_NOT_FOUND'
        );
    END IF;

    -- Return success response with updated status
    RETURN jsonb_build_object(
        'success', true,
        'code', 'PAYMENT_STATUS_UPDATED',
        'metadata', jsonb_build_object(
            'hasPaid', v_updated_player."hasPaid",
            'hasDiscount', v_updated_player."hasDiscount",
            'hasGratis', v_updated_player."hasGratis"
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_player_payment_status(UUID, TEXT, TEXT, BOOLEAN) TO authenticated;

*/