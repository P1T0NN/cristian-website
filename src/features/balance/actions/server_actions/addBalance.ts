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
import type { typesUser } from '@/features/players/types/typesPlayer';

interface AddBalanceResponse {
    success: boolean;
    message: string;
    // Keep any here
    
    data?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        balance: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: any;
    };
}

interface AddBalanceParams {
    playerIdFromParams: string;
    amount: number;
    reason: string;
    addedBy: string;
    isAdmin: boolean;
}

export async function addBalance({
    playerIdFromParams,
    amount,
    reason,
    addedBy,
    isAdmin
}: AddBalanceParams): Promise<AddBalanceResponse> {
    const t = await getTranslations("GenericMessages");

    if (!isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!playerIdFromParams || !amount || !reason || !addedBy) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Fetch the user data
    const { data: userData, error: userFetchError } = await supabase
        .from('user')
        .select('*')
        .eq('id', playerIdFromParams)
        .single();

    if (userFetchError) {
        return { success: false, message: t('USER_FETCH_FAILED') };
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
                    player_name: user.name,
                    balance_added: amount,
                    reason: reason,
                    added_by: addedBy
                }
            ])
            .select(),
        supabase
            .from('user')
            .update({ balance: newBalance })
            .eq('id', playerIdFromParams)
            .select()
    ]);

    if (balanceInsertResult.error) {
        return { success: false, message: t('BALANCE_FAILED_TO_INSERT') };
    }

    if (userUpdateResult.error) {
        return { success: false, message: t('BALANCE_UPDATE_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);

    return { 
        success: true, 
        message: t("BALANCE_ADDED"), 
        data: { balance: balanceInsertResult.data, user: userUpdateResult.data } 
    };
}