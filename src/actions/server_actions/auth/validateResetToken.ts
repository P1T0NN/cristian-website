"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function validateResetToken(resetPasswordToken: string): Promise<APIResponse> {
    if (!resetPasswordToken) {
        return { success: false, message: 'Reset password token is required' };
    }

    const { data, error } = await supabase
        .from('reset_password_tokens')
        .select('*')
        .eq('token', resetPasswordToken)
        .single();

    if (error || !data) {
        return { success: false, message: 'Invalid or expired token' };
    }

    // Check if the token has expired
    const now = new Date();
    const tokenExpiry = new Date(data.expires_at);
    
    if (now > tokenExpiry) {
        return { success: false, message: 'Token has expired' };
    }

    return { success: true, message: 'Token is valid' };
}