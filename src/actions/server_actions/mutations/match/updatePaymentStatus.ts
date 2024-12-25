"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function updatePaymentStatus(
    authToken: string,
    matchId: string,
    playerId: string,
    hasPaid: boolean,
    hasDiscount: boolean,
    hasGratis: boolean,
    currentUserMatchAdmin: boolean,
    isTemporaryPlayer: boolean
) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !playerId || typeof hasPaid !== 'boolean' || typeof hasDiscount !== 'boolean' || typeof hasGratis !== 'boolean') {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Check if the authenticated user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    const isAuthorized = 
        (userData?.isAdmin) || // System admin
        currentUserMatchAdmin; // Match admin (using passed prop instead of database query)

    if (userError || !isAuthorized) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Update the payment status
    const tableName = isTemporaryPlayer ? 'temporary_players' : 'match_players';
    const idColumn = isTemporaryPlayer ? 'id' : 'user_id';

    const { error: updateError } = await supabase
        .from(tableName)
        .update({
            has_paid: hasPaid,
            has_discount: hasDiscount,
            has_gratis: hasGratis
        })
        .match({ match_id: matchId, [idColumn]: playerId });

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages('PAYMENT_STATUS_UPDATED_SUCCESSFULLY')
    };
}
