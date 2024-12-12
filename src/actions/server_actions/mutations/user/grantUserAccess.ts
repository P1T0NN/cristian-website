"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function grantUserAccess(authToken: string, userId: string): Promise<APIResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId) {
        return { success: false, message: t('INVALID_USER_ID') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ has_access: true })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('USER_GRANT_ACCESS_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('USER_ACCESS_GRANTED_SUCCESSFULLY'), data };
}