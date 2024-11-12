"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

export async function deleteMatchFromHistory(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
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