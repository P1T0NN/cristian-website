"use server"

// NEXTJS IMPORTS
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesUser } from '../../types/typesPlayer';

interface UpdateUserNameResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface UpdateUserNameParams {
    name: string;
}

export async function updateUserName({ 
    name 
}: UpdateUserNameParams): Promise<UpdateUserNameResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!name) {
        return { success: false, message: t('FULL_NAME_REQUIRED') };
    }

    const { data, error: supabaseError } = await supabase
        .from('user')
        .update({ name })
        .eq('id', userId)
        .select()
        .single();

    if (supabaseError) {
        return { success: false, message: t('USER_UPDATE_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);

    return { success: true, message: t('USER_FULL_NAME_UPDATED'), data: data as typesUser };
}