"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { typesAddDebtForm } from '@/types/forms/AddDebtForm';
import type { typesUser } from "@/types/typesUser";

export async function addDebt(authToken: string, addDebtData: typesAddDebtForm) {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Parallel execution of debt insertion and user fetch
    const [debtInsertResult, userFetchResult] = await Promise.all([
        supabase
            .from('debts')
            .insert([
                {
                    player_name: addDebtData.player_name,
                    player_debt: addDebtData.player_debt,
                    cristian_debt: addDebtData.cristian_debt,
                    reason: addDebtData.reason,
                    added_by: addDebtData.added_by
                }
            ])
            .select(),
        supabase
            .from('users')
            .select('*')
            .eq('fullName', addDebtData.player_name)
            .single()
    ]);

    if (debtInsertResult.error) {
        return { success: false, message: genericMessages('DEBT_CREATION_FAILED') };
    }

    if (userFetchResult.error) {
        return { success: false, message: fetchMessages('USER_FETCH_FAILED') };
    }

    const user = userFetchResult.data as typesUser;

    // Calculate new debt values
    const newPlayerDebt = user.player_debt + (addDebtData.player_debt || 0);
    const newCristianDebt = user.cristian_debt + (addDebtData.cristian_debt || 0);

    // Update users table
    const { data: userUpdateData, error: userUpdateError } = await supabase
        .from('users')
        .update({
            player_debt: newPlayerDebt,
            cristian_debt: newCristianDebt
        })
        .eq('fullName', addDebtData.player_name)
        .select();

    if (userUpdateError) {
        return { success: false, message: genericMessages('USER_DEBT_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages("DEBT_CREATED_AND_USER_UPDATED"), 
        data: { debt: debtInsertResult.data, user: userUpdateData } 
    };
}