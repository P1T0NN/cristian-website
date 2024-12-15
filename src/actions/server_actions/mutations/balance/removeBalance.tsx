"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function removeBalance(authToken: string, playerId: string, amount: number, isAdmin: boolean) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Fetch the current balance
    const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', playerId)
        .single();

    if (fetchError) {
        return { success: false, message: genericMessages('USER_NOT_FOUND') };
    }

    const currentBalance = userData.balance || 0;
    const newBalance = currentBalance - amount;

    if (newBalance < 0) {
        return { success: false, message: genericMessages('INSUFFICIENT_BALANCE') };
    }

    // Update the balance
    const { data, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', playerId);

    if (updateError) {
        return { success: false, message: genericMessages('BALANCE_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('BALANCE_REMOVED'), data };
}