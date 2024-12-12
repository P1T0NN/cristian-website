"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function addBalance(authToken: string, playerId: string, amount: number, isAdmin: boolean) {
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
    const newBalance = currentBalance + amount;

    // Update the balance
    const { data, error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', playerId);

    if (error) {
        return { success: false, message: genericMessages('BALANCE_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('BALANCE_ADDED'), data };
}