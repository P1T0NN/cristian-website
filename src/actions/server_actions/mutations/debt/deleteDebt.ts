"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesDebt } from "@/types/typesDebt";
import type { typesUser } from "@/types/typesUser";

interface DeleteDebtResponse {
    success: boolean;
    message: string;
    data?: {
        deletedDebt: typesDebt;
        updatedUser: typesUser;
    };
}

interface DeleteDebtParams {
    debtId: string;
}

export async function deleteDebt({ 
    debtId 
}: DeleteDebtParams): Promise<DeleteDebtResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!debtId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Fetch the debt to be deleted
    const { data: debt, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('id', debtId)
        .single();

    if (fetchError) {
        return { success: false, message: t('DEBT_FETCH_FAILED') };
    }

    // Delete the debt
    const { error: deleteError } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);

    if (deleteError) {
        return { success: false, message: t('DEBT_DELETION_FAILED') };
    }

    // Fetch the current user data
    const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('fullName', debt.player_name)
        .single();

    if (userFetchError) {
        return { success: false, message: t('USER_FETCH_FAILED') };
    }

    // Calculate new debt values
    const newPlayerDebt = (userData.player_debt || 0) - (debt.player_debt || 0);
    const newCristianDebt = (userData.cristian_debt || 0) - (debt.cristian_debt || 0);

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
        return { success: false, message: t('USER_DEBT_UPDATE_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);

    return { 
        success: true, 
        message: t("DEBT_DELETED"), 
        data: { 
            deletedDebt: debt as typesDebt, 
            updatedUser: updatedUser[0] as typesUser 
        } 
    };
}