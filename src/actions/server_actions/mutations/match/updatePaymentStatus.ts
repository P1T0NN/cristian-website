"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

export async function updatePaymentStatus(
    authToken: string,
    matchId: string,
    playerId: string,
    hasPaid: boolean,
    hasDiscount: boolean,
    hasGratis: boolean
) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    if (!matchId || !playerId || typeof hasPaid !== 'boolean' || typeof hasDiscount !== 'boolean' || typeof hasGratis !== 'boolean') {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Check if the authenticated user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', payload.sub)
        .single();

    if (userError || !userData || !userData.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Update the payment status
    const { error: updateError } = await supabase
        .from('match_players')
        .update({
            has_paid: hasPaid,
            has_discount: hasDiscount,
            has_gratis: hasGratis
        })
        .match({ match_id: matchId, user_id: playerId });

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages('PAYMENT_STATUS_UPDATED_SUCCESSFULLY')
    };
}