"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

export async function addBalance(authToken: string, playerId: string, amount: number) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
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