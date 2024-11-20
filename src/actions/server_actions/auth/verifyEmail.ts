"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function verifyEmail(token: string): Promise<APIResponse> {
    const { data: verification, error: verificationError } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('token', token)
        .single();

    if (verificationError || !verification) {
        return { success: false, message: 'Invalid verification link. Please request a new one.' };
    }

    if (new Date(verification.expires_at) < new Date()) {
        const { error: deleteError } = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', verification.id);
        
        if (deleteError) {
            return { success: false, message: "Error deleting expired verification!" };
        }
        
        return { success: false, message: 'Verification link has expired. Please request a new one.' };
    }

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', verification.user_id)
        .single();

    if (userError || !user) {
        const { error: deleteError } = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', verification.id);
        
        if (deleteError) {
            return { success: false, message: "Error deleting verification for non-existent user!" };
        }

        return { success: false, message: 'User not found. Please contact support.' };
    }

    if (user.is_verified) {
        const { error: deleteError } = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', verification.id);
        
        if (deleteError) {
            return { success: false, message: "Error deleting verification for already verified user!" };
        }

        return { success: true, message: 'Email already verified. You can now log in.' };
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', verification.user_id);

    if (updateError) {
        return { success: false, message: 'Error updating user verification status' };
    }

    const { error: deleteError } = await supabase
        .from('user_verifications')
        .delete()
        .eq('id', verification.id);
    
    if (deleteError) {
        return { success: true, message: 'Email verified successfully, but there was an issue cleaning up. You can now log in.' };
    }
        
    return { success: true, message: 'Email verified successfully. You can now log in.' };
}