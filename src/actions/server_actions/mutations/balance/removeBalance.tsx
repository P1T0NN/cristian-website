"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function removeBalance(authToken: string, playerId: string, balanceId: string, isAdmin: boolean) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!playerId || !balanceId || !isAdmin) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Fetch the balance entry
    const { data: balanceEntry, error: balanceError } = await supabase
        .from('balances')
        .select('balance_added')
        .eq('id', balanceId)
        .single();

    if (balanceError) {
        return { success: false, message: genericMessages('BALANCE_ENTRY_NOT_FOUND') };
    }

    // Fetch the current user balance
    const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', playerId)
        .single();

    if (fetchError) {
        return { success: false, message: genericMessages('USER_NOT_FOUND') };
    }

    const currentBalance = userData.balance || 0;
    const amountToRemove = balanceEntry.balance_added;
    const newBalance = currentBalance - amountToRemove;

    // Start a Supabase transaction
    const { data, error } = await supabase.from('users').update({ balance: newBalance }).eq('id', playerId);

    if (error) {
        return { success: false, message: genericMessages('BALANCE_UPDATE_FAILED') };
    }

    // Remove the balance entry
    const { error: deleteError } = await supabase
        .from('balances')
        .delete()
        .eq('id', balanceId);

    if (deleteError) {
        // If deletion fails, we should revert the balance update
        await supabase
            .from('users')
            .update({ balance: currentBalance })
            .eq('id', playerId);
            
        return { success: false, message: genericMessages('BALANCE_REMOVAL_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('BALANCE_REMOVED'), data };
}