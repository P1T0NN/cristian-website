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

interface DeleteMatchFromHistoryResponse {
    success: boolean;
    message: string;
}

interface DeleteMatchFromHistoryParams {
    matchId: string;
}

export async function deleteMatchFromHistory({
    matchId
}: DeleteMatchFromHistoryParams): Promise<DeleteMatchFromHistoryResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { error } = await supabase
        .from('match_history')
        .delete()
        .match({ id: matchId });

    if (error) {
        return { success: false, message: t('MATCH_HISTORY_DELETION_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.MATCH_HISTORY);

    return { success: true, message: t("MATCH_HISTORY_DELETED") };
}