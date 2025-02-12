"use server"

// NEXTJS IMPORTS
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import { typesBalance } from '../../types/typesBalance';

interface RemoveBalanceResponse {
    success: boolean;
    message: string;
    data?: Partial<typesBalance> | null;
}

interface RemoveBalanceParams {
    playerIdFromParams: string;
    balanceId: string;
    isAdmin: boolean;
}

export async function removeBalance({
    playerIdFromParams,
    balanceId,
    isAdmin
}: RemoveBalanceParams): Promise<RemoveBalanceResponse> {
    const t = await getTranslations("GenericMessages");

    if (!isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!playerIdFromParams || !balanceId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Fetch the balance entry
    const { data: balanceEntry, error: balanceError } = await supabase
        .from('balances')
        .select('balance_added')
        .eq('id', balanceId)
        .single();

    if (balanceError) {
        return { success: false, message: t('BALANCE_ENTRY_NOT_FOUND') };
    }

    // Fetch the current user balance
    const { data: userData, error: fetchError } = await supabase
        .from('user')
        .select('balance')
        .eq('id', playerIdFromParams)
        .single();

    if (fetchError) {
        return { success: false, message: t('USER_NOT_FOUND') };
    }

    const currentBalance = userData.balance || 0;
    const amountToRemove = balanceEntry.balance_added;
    const newBalance = currentBalance - amountToRemove;

    // Update user balance
    const { data, error } = await supabase
        .from('user')
        .update({ balance: newBalance })
        .eq('id', playerIdFromParams);

    if (error) {
        return { success: false, message: t('BALANCE_UPDATE_FAILED') };
    }

    // Remove the balance entry
    const { error: deleteError } = await supabase
        .from('balances')
        .delete()
        .eq('id', balanceId);

    if (deleteError) {
        // If deletion fails, revert the balance update
        await supabase
            .from('user')
            .update({ balance: currentBalance })
            .eq('id', playerIdFromParams);
            
        return { success: false, message: t('BALANCE_REMOVAL_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);

    return { success: true, message: t('BALANCE_REMOVED'), data: data ? data[0] : null };
}