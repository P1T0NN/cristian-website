"use server"

// LIBRARIES
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// UTILS
import { generateResetPasswordToken } from '@/utils/auth/auth-utils';

// EMAIL TEMPLATES
import { PasswordResetEmailTemplate } from '@/email_templates/password-reset-email-template';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetPasswordEmail(email: string): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    // Check if user exists
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (userError) {
        // Don't reveal if the user exists or not
        return { success: true, message: t('PASSWORD_RESET_EMAIL_SENT') };
    }

    if (!user) {
        return { success: true, message: t('PASSWORD_RESET_EMAIL_SENT') };
    }

    const resetToken = generateResetPasswordToken();
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save the reset token
    const { error: tokenError } = await supabase
        .from('reset_password_tokens')
        .insert({ 
            user_id: user.id, 
            token: resetToken,
            expires_at: expirationTime.toISOString()
        });

    if (tokenError) {
        return { success: false, message: t('RESET_TOKEN_ERROR') };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset_password?token=${resetToken}`;

    await resend.emails.send({
        from: 'Cris Futbol <onboarding@resend.dev>',
        to: email,
        subject: t('PASSWORD_RESET_EMAIL_SUBJECT'),
        react: PasswordResetEmailTemplate({ resetUrl }),
    });

    return { success: true, message: t('PASSWORD_RESET_EMAIL_SUCCESS') };
}