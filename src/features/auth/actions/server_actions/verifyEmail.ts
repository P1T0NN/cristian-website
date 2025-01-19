"use server"

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/shared/types/responses/APIResponse';

export async function verifyEmail(token: string): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    const { data: verification, error: verificationError } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('token', token)
        .single();

    if (verificationError || !verification) {
        return { success: false, message: t('INVALID_VERIFICATION_LINK') };
    }

    if (new Date(verification.expires_at) < new Date()) {
        const { error: deleteError } = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', verification.id);
        
        if (deleteError) {
            return { success: false, message: t('ERROR_DELETING_EXPIRED_VERIFICATION') };
        }
        
        return { success: false, message: t('VERIFICATION_LINK_EXPIRED') };
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
            return { success: false, message: t('ERROR_DELETING_NONEXISTENT_USER_VERIFICATION') };
        }

        return { success: false, message: t('USER_NOT_FOUND') };
    }

    if (user.is_verified) {
        const { error: deleteError } = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', verification.id);
        
        if (deleteError) {
            return { success: false, message: t('ERROR_DELETING_VERIFIED_USER_VERIFICATION') };
        }

        return { success: true, message: t('EMAIL_ALREADY_VERIFIED') };
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', verification.user_id);

    if (updateError) {
        return { success: false, message: t('ERROR_UPDATING_VERIFICATION_STATUS') };
    }

    const { error: deleteError } = await supabase
        .from('user_verifications')
        .delete()
        .eq('id', verification.id);
    
    if (deleteError) {
        return { success: true, message: t('EMAIL_VERIFIED_CLEANUP_ISSUE') };
    }
        
    return { success: true, message: t('EMAIL_VERIFIED_SUCCESS') };
}