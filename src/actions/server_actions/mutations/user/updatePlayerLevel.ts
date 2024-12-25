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

export async function updatePlayerLevel(authToken: string, userId: string, newLevel: string): Promise<APIResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId || !newLevel) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ player_level: newLevel })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('UPDATE_PLAYER_LEVEL_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('PLAYER_LEVEL_UPDATED_SUCCESSFULLY'), data };
}