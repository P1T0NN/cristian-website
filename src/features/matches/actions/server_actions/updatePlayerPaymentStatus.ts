"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
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
        has_paid: boolean;
        has_discount: boolean;
        has_gratis: boolean;
    };
}

export async function updatePlayerPaymentStatus({
    matchIdFromParams,
    matchPlayerId,
    type,
    currentValue
}: UpdatePlayerPaymentStatusParams): Promise<UpdatePlayerPaymentStatusResponse> {
    const t = await getTranslations("GenericMessages");
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    const { isAuth } = await verifyAuth(authToken as string);

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Call RPC function to handle all payment status updates
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

CREATE OR REPLACE FUNCTION update_player_payment_status(
    p_match_id UUID,
    p_player_id UUID,
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
    -- Update the player's payment status
    WITH updated AS (
        UPDATE match_players
        SET 
            has_paid = CASE 
                WHEN p_type = 'paid' THEN NOT p_current_value
                WHEN p_type = 'gratis' THEN NOT p_current_value  -- Set has_paid when gratis changes
                ELSE has_paid
            END,
            has_discount = CASE 
                WHEN p_type = 'discount' THEN NOT p_current_value
                WHEN p_type = 'gratis' AND NOT p_current_value THEN false  -- Reset discount when gratis is given
                ELSE has_discount
            END,
            has_gratis = CASE 
                WHEN p_type = 'gratis' THEN NOT p_current_value
                ELSE has_gratis
            END
        WHERE id = p_player_id 
        AND match_id = p_match_id
        RETURNING *
    )
    SELECT * INTO v_updated_player FROM updated;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'PLAYER_NOT_FOUND'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'PAYMENT_STATUS_UPDATED',
        'metadata', jsonb_build_object(
            'has_paid', v_updated_player.has_paid,
            'has_discount', v_updated_player.has_discount,
            'has_gratis', v_updated_player.has_gratis
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

GRANT EXECUTE ON FUNCTION update_player_payment_status(UUID, UUID, TEXT, BOOLEAN) TO authenticated;

*/