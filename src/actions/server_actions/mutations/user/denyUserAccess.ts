"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function denyUserAccess(authToken: string, userId: string): Promise<APIResponse> {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    try {
        await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    if (!userId) {
        return { success: false, message: t('INVALID_USER_ID') };
    }

    const { data, error } = await supabase.rpc('deny_user_access', {
        in_user_id: userId
    });

    if (error) {
        return { success: false, message: t('USER_DENY_ACCESS_FAILED') };
    }

    if (!data.success) {
        return { success: false, message: t('USER_DENY_ACCESS_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('USER_ACCESS_DENIED_SUCCESSFULLY') };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION deny_user_access(in_user_id UUID) RETURNS JSONB AS $$
DECLARE
    v_user RECORD;
    v_refresh_count INTEGER := 0;
    v_verification_count INTEGER := 0;
    v_reset_count INTEGER := 0;
    v_user_count INTEGER := 0;
BEGIN
    -- Check if the user exists
    SELECT * INTO v_user FROM users WHERE id = in_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_ID_INVALID');
    END IF;

    -- Delete from refresh_tokens
    DELETE FROM refresh_tokens WHERE user_id = in_user_id;
    GET DIAGNOSTICS v_refresh_count = ROW_COUNT;

    -- Delete from user_verifications
    DELETE FROM user_verifications WHERE user_id = in_user_id;
    GET DIAGNOSTICS v_verification_count = ROW_COUNT;

    -- Delete from reset_password_tokens
    DELETE FROM reset_password_tokens WHERE user_id = in_user_id;
    GET DIAGNOSTICS v_reset_count = ROW_COUNT;

    -- Finally, delete the user
    DELETE FROM users WHERE id = in_user_id;
    GET DIAGNOSTICS v_user_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'USER_ACCESS_DENIED_SUCCESSFULLY',
        'details', jsonb_build_object(
            'refresh_tokens_deleted', v_refresh_count,
            'verifications_deleted', v_verification_count,
            'reset_tokens_deleted', v_reset_count,
            'users_deleted', v_user_count
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNKNOWN_ERROR', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/