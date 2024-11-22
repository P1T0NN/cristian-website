"use server"

// NEXTJS IMPORTS
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function validateResetToken(resetPasswordToken: string): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    if (!resetPasswordToken) {
        return { success: false, message: t('RESET_TOKEN_REQUIRED') };
    }

    const { data, error } = await supabase
        .from('reset_password_tokens')
        .select('*')
        .eq('token', resetPasswordToken)
        .single();

    if (error || !data) {
        return { success: false, message: t('INVALID_OR_EXPIRED_TOKEN') };
    }

    // Check if the token has expired
    const now = new Date();
    const tokenExpiry = new Date(data.expires_at);
    
    if (now > tokenExpiry) {
        return { success: false, message: t('TOKEN_EXPIRED') };
    }

    return { success: true, message: t('TOKEN_VALID') };
}