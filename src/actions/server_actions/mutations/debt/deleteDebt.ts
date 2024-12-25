"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function deleteDebt(authToken: string, debtId: string) {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!debtId) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Fetch the debt to be deleted
    const { data: debt, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('id', debtId)
        .single();

    if (fetchError) {
        return { success: false, message: fetchMessages('DEBT_FETCH_FAILED') };
    }

    // Delete the debt
    const { error: deleteError } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);

    if (deleteError) {
        return { success: false, message: genericMessages('DEBT_DELETION_FAILED') };
    }

    // Fetch the current user data
    const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('player_debt, cristian_debt')
        .eq('fullName', debt.player_name)
        .single();

    if (userFetchError) {
        return { success: false, message: fetchMessages('USER_FETCH_FAILED') };
    }

    // Calculate new debt values
    const newPlayerDebt = userData.player_debt - debt.player_debt;
    const newCristianDebt = userData.cristian_debt - debt.cristian_debt;

    // Update the user's debt
    const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
            player_debt: newPlayerDebt,
            cristian_debt: newCristianDebt
        })
        .eq('fullName', debt.player_name)
        .select();

    if (updateError) {
        return { success: false, message: genericMessages('USER_DEBT_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages("DEBT_DELETED"), data: { deletedDebt: debt, updatedUser: updatedUser[0] } };
}