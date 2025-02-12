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

interface GrantUserAccessResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface GrantUserAccessParams {
    userId: string;
}

export async function grantUserAccess({ 
    userId 
}: GrantUserAccessParams): Promise<GrantUserAccessResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('user')
        .update({ hasAccess: true })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('USER_GRANT_ACCESS_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);
    return { success: true, message: t('USER_ACCESS_GRANTED_SUCCESSFULLY'), data: data as typesUser };
}