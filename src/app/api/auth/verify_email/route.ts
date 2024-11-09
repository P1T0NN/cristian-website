// LIBRARIES
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(request: Request): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const { token } = await request.json();

    // Validate token existence
    if (!token) {
        return NextResponse.json({ success: false, message: t('INVALID_REGISTER_VERIFICATION_TOKEN') }, { status: 400 });
    }

    // Verify the token in the database
    const { data, error: verificationError } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('verification_token', token)
        .single();

    if (verificationError || !data) {
        return NextResponse.json({ success: false, message: t('INVALID_REGISTER_VERIFICATION_TOKEN') }, { status: 404 });
    }

    // Check if the token has expired
    const currentTime = new Date();

    if (new Date(data.expires_at) < currentTime) {
        // If expired, delete the token and return the expired message
        const deleteResult = await supabase
            .from('user_verifications')
            .delete()
            .eq('id', data.id);

        // Handle potential deletion errors
        if (deleteResult.error) {
            return NextResponse.json({ success: false, message: t('ERROR_REGISTER_VERIFICATION_TOKEN_EXPIRED') }, { status: 500 });
        }

        return NextResponse.json({ success: false, message: t('ERROR_REGISTER_VERIFICATION_TOKEN_EXPIRED') }, { status: 410 });
    }

    // Proceed with verifying the user if the token is still valid
    const updateUser = supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', data.user_id);

    const deleteToken = supabase
        .from('user_verifications')
        .delete()
        .eq('id', data.id);

    const [updateResult, deleteResult] = await Promise.all([updateUser, deleteToken]);

    if (updateResult.error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_VERIFY_USER') }, { status: 500 });
    }
    
    if (deleteResult.error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_VERIFY_USER') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('USER_VERIFIED') }, { status: 200 });
}