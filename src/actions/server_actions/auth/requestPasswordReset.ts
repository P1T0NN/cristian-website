"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// SERVER ACTIONS
import { sendResetPasswordEmail } from '@/actions/server_actions/auth/sendResetPasswordEmail';

// UTILS
import { generateResetPasswordToken } from '@/utils/auth/auth-utils';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function requestPasswordReset(email: string) {
    const startTime = Date.now();

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            // Don't return here to maintain consistent timing
        }

        if (user) {
            const resetToken = generateResetPasswordToken();
            const { error: tokenError } = await supabase
                .from('reset_password_tokens')
                .insert({ user_id: user.id, token: resetToken, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) });

            if (tokenError) {
                console.error('Error inserting reset token:', tokenError);
            } else {
                try {
                    await sendResetPasswordEmail(user.email);
                } catch (emailError) {
                    console.error('Error sending reset password email:', emailError);
                }
            }
        }

        const operationTime = Date.now() - startTime;

        if (operationTime < 3000) {
            await delay(3000 - operationTime);
        }

        return { success: true, message: 'If a user with that email exists, a password reset link has been sent.' };
    } catch (error) {
        console.error('Unexpected error in requestPasswordReset:', error);
        // Still return a success message to not reveal if the email exists
        return { success: true, message: 'If a user with that email exists, a password reset link has been sent.' };
    }
}