"use server"

// LIBRARIES
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { generateVerificationToken } from '@/utils/auth/auth-utils';

// EMAIL TEMPLATES
import { VerificationEmailTemplate } from '@/email_templates/verification-email-template';

// TYPES
import { APIResponse } from '@/types/responses/APIResponse';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string): Promise<APIResponse> {
    console.log('Attempting to send verification email to:', email);

    // Check if user exists and is not verified
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, is_verified')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('User not found:', userError);
        return { success: false, message: 'User not found' };
    }

    if (user.is_verified) {
        console.log('User is already verified');
        return { success: true, message: 'User is already verified' };
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
        console.error('Error creating verification token:', tokenError);
        return { success: false, message: 'Error creating verification token' };
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify_email?token=${verificationToken}`;

    try {
        const result = await resend.emails.send({
            from: 'Cris Futbol <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email',
            react: VerificationEmailTemplate({ verificationUrl }),
        });
        console.log('Email sent successfully:', result);
        return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Failed to send verification email' };
    }
}