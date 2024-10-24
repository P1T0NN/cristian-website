// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import argon2 from 'argon2';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const rateLimitResult = await applyRateLimit(req, 'resetPassword');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: t('PASSWORD_RESET_RATE_LIMITED') }, { status: 429 });
    }

    const requestBody = await req.json();
    const { token, password } = requestBody;

    if (!token || !password) {
        return NextResponse.json({ success: false, message: t('RESET_PASSWORD_TOKEN_REQUIRED') }, { status: 400 });
    }

    const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/validate_reset_password_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });

    const validationData = await validationResponse.json();

    if (!validationResponse.ok || !validationData.success) {
        return NextResponse.json({ success: false, message: t('INVALID_RESET_PASSWORD_TOKEN') }, { status: 400 });
    }

    const email = validationData.email;
    if (!email) {
        return NextResponse.json({ success: false, message: t('EMAIL_NOT_FOUND') }, { status: 400 });
    }

    const hashedPassword = await argon2.hash(password);

    const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', email);

    if (updateError) {
        return NextResponse.json({ success: false, message: t('PASSWORD_RESET_FAILED') }, { status: 500 });
    }

    const { error: deleteError } = await supabase
        .from('reset_password_tokens')
        .delete()
        .eq('token', token);

    if (deleteError) {
        return NextResponse.json({ success: false, message: t('UNKNOWN_ERROR') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('PASSWORD_RESET_SUCCESS') }, { status: 200 });
}