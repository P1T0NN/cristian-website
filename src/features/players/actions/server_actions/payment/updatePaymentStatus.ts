"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface UpdatePaymentStatusResponse {
    success: boolean;
    message: string;
}

interface UpdatePaymentStatusParams {
    matchIdFromParams: string;
    playerId: string;
    hasPaid: boolean;
    hasDiscount: boolean;
    hasGratis: boolean;
    currentUserMatchAdmin: boolean;
    isTemporaryPlayer: boolean;
}

export async function updatePaymentStatus({
    matchIdFromParams,
    playerId,
    hasPaid,
    hasDiscount,
    hasGratis,
    currentUserMatchAdmin,
    isTemporaryPlayer
}: UpdatePaymentStatusParams): Promise<UpdatePaymentStatusResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !playerId || typeof hasPaid !== 'boolean' || typeof hasDiscount !== 'boolean' || typeof hasGratis !== 'boolean') {
        return { success: false, message: t('BAD_REQUEST') };
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
        return { success: false, message: t('UNAUTHORIZED') };
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
        .match({ match_id: matchIdFromParams, [idColumn]: playerId });

    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t('PAYMENT_STATUS_UPDATED_SUCCESSFULLY')
    };
}