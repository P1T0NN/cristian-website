"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { typesUser } from "@/types/typesUser";

export async function addBalance(authToken: string, playerId: string, amount: number, reason: string, addedBy: string, isAdmin: boolean) {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    if (!isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!playerId || !amount || !reason || !addedBy || !isAdmin) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Fetch the user data
    const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', playerId)
        .single();

    if (userFetchError) {
        return { success: false, message: fetchMessages('USER_FETCH_FAILED') };
    }

    const user = userData as typesUser;

    // Calculate new balance
    const newBalance = (user.balance || 0) + amount;

    // Parallel execution of balance insertion and user update
    const [balanceInsertResult, userUpdateResult] = await Promise.all([
        supabase
            .from('balances')
            .insert([
                {
                    player_name: user.fullName,
                    balance_added: amount,
                    reason: reason,
                    added_by: addedBy // Coming and passing from component currentUserData.fullName
                }
            ])
            .select(),
        supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', playerId)
            .select()
    ]);

    if (balanceInsertResult.error) {
        return { success: false, message: genericMessages('BALANCE_FAILED_TO_INSERT') };
    }

    if (userUpdateResult.error) {
        return { success: false, message: genericMessages('BALANCE_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages("BALANCE_ADDED"), 
        data: { balance: balanceInsertResult.data, user: userUpdateResult.data } 
    };
}