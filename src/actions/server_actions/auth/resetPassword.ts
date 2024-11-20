"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { hashPassword } from '@/utils/argon2';

export async function resetPassword(token: string, newPassword: string) {
    const { data: resetToken, error: tokenError } = await supabase
        .from('reset_password_tokens')
        .select('*')
        .eq('token', token)
        .single();

    if (tokenError || !resetToken || new Date() > new Date(resetToken.expires_at)) {
        return { success: false, message: 'Invalid or expired reset token' };
    }

    const hashedPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', resetToken.user_id);

    if (updateError) {
        return { success: false, message: 'Error updating password' };
    }

    await supabase
        .from('reset_password_tokens')
        .delete()
        .eq('id', resetToken.id);

    return { success: true, message: 'Password has been reset successfully' };
}