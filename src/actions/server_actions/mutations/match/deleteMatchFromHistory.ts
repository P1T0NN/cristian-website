"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function deleteMatchFromHistory(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('MATCH_ID_INVALID') };
    }

    const { error } = await supabase
        .from('match_history')
        .delete()
        .match({ id: matchId });

    if (error) {
        return { success: false, message: genericMessages('MATCH_HISTORY_DELETION_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_HISTORY_DELETED") };
}