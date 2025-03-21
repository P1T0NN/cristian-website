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
    hasPaid?: boolean;
    hasDiscount?: boolean;
    hasGratis?: boolean;
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

    // Get current player payment status
    const { data: player, error: playerError } = await supabase
        .from("match_players")
        .select("hasPaid, hasDiscount, hasGratis")
        .eq("id", matchPlayerId) 
        .eq("matchId", matchIdFromParams)
        .single();
    
    if (playerError) {
        return { success: false, message: t('PLAYER_NOT_FOUND') };
    }
    
    // Calculate new payment status values
    let newHasPaid = player.hasPaid;
    let newHasDiscount = player.hasDiscount;
    let newHasGratis = player.hasGratis;
    
    if (type === 'paid') {
        newHasPaid = !currentValue;
    } else if (type === 'discount') {
        newHasDiscount = !currentValue;
    } else if (type === 'gratis') {
        newHasGratis = !currentValue;
        
        // Auto set hasPaid when gratis is given
        if (!currentValue) {
            newHasPaid = true;
            // Reset discount when gratis is given
            newHasDiscount = false;
        }
    }
    
    // Update the player's payment status
    const { error: updateError } = await supabase
        .from("match_players")
        .update({
            hasPaid: newHasPaid,
            hasDiscount: newHasDiscount,
            hasGratis: newHasGratis
        })
        .eq("id", matchPlayerId)
        .eq("matchId", matchIdFromParams);
    
    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);
    
    return { 
        success: true, 
        message: t('PAYMENT_STATUS_UPDATED_SUCCESSFULLY'),
        hasPaid: newHasPaid,
        hasDiscount: newHasDiscount,
        hasGratis: newHasGratis
    };
};