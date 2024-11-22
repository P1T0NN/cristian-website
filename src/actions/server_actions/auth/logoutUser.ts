"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { verifyToken } from '@/utils/auth/jwt';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function logoutUser(): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return { success: false, message: t('NO_ACTIVE_SESSION') };
    }

    // Verify the token to get the user ID
    const payload = await verifyToken(authToken);
    const userId = payload.sub;

    // Remove the refresh token from the database
    const { error: deleteError } = await supabase
        .from('refresh_tokens')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        return { success: false, message: t('LOGOUT_ERROR') };
    }

    // Clear the cookies
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');

    return { success: true, message: t('LOGOUT_SUCCESSFUL') };
}