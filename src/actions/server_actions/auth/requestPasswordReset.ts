"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVER ACTIONS
import { sendResetPasswordEmail } from '@/actions/server_actions/auth/sendResetPasswordEmail';

// UTILS
import { generateResetPasswordToken } from '@/utils/auth/auth-utils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function requestPasswordReset(email: string) {
    const t = await getTranslations('GenericMessages');
    const startTime = Date.now();

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        // Don't return here to maintain consistent timing
    }

    if (user) {
        const resetToken = generateResetPasswordToken();
        const { error: tokenError } = await supabase
            .from('reset_password_tokens')
            .insert({ user_id: user.id, token: resetToken, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) });

        if (!tokenError) {
            await sendResetPasswordEmail(user.email);
        }
    }

    const operationTime = Date.now() - startTime;

    if (operationTime < 3000) {
        await delay(3000 - operationTime);
    }

    return { success: true, message: t('PASSWORD_RESET_REQUEST_SENT') };
}