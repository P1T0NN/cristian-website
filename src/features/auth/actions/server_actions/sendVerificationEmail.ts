"use server"

// NEXTJS IMPORTS
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { Resend } from 'resend';
import { supabase } from '@/shared/lib/supabase/supabase';

// UTILS
import { generateVerificationToken } from '../../utils/auth-utils';

// EMAIL TEMPLATES
import { VerificationEmailTemplate } from '@/shared/email_templates/verification-email-template';

// TYPES
import { APIResponse } from '@/shared/types/responses/APIResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    if (!email) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if user exists and is not verified
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, is_verified')
        .eq('email', email)
        .single();

    if (userError || !user) {
        return { success: false, message: t('USER_NOT_FOUND') };
    }

    if (user.is_verified) {
        return { success: true, message: t('USER_ALREADY_VERIFIED') };
    }

    const verificationToken = generateVerificationToken();

    // Save the verification token
    const { error: tokenError } = await supabase
        .from('user_verifications')
        .insert({ 
            user_id: user.id, 
            token: verificationToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });

    if (tokenError) {
        return { success: false, message: t('VERIFICATION_TOKEN_ERROR') };
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify_email?token=${verificationToken}`;

    await resend.emails.send({
        from: 'Cris Futbol <noreply@crys-sports.com>',
        to: email,
        subject: t('VERIFICATION_EMAIL_SUBJECT'),
        react: VerificationEmailTemplate({ verificationUrl }),
    });
    
    return { success: true, message: t('VERIFICATION_EMAIL_SENT') };
}