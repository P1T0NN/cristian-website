"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesAddDebtForm } from '@/types/forms/AddDebtForm';
import type { typesUser } from "@/types/typesUser";
import type { typesDebt } from "@/types/typesDebt";

interface AddDebtResponse {
    success: boolean;
    message: string;
    data?: {
        debt: typesDebt;
        user: typesUser;
    };
}

interface AddDebtParams {
    addDebtData: typesAddDebtForm;
}

export async function addDebt({ 
    addDebtData 
}: AddDebtParams): Promise<AddDebtResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!addDebtData) {
        return { success: false, message: t('BAD_REQUEST') };
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
        return { success: false, message: t('DEBT_CREATION_FAILED') };
    }

    if (userFetchResult.error) {
        return { success: false, message: t('USER_FETCH_FAILED') };
    }

    const user = userFetchResult.data as typesUser;

    // Calculate new debt values
    const newPlayerDebt = (user.player_debt || 0) + (addDebtData.player_debt || 0);
    const newCristianDebt = (user.cristian_debt || 0) + (addDebtData.cristian_debt || 0);

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
        return { success: false, message: t('USER_DEBT_UPDATE_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t("DEBT_CREATED_AND_USER_UPDATED"), 
        data: { 
            debt: debtInsertResult.data[0] as typesDebt, 
            user: userUpdateData[0] as typesUser 
        } 
    };
}