// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { apiRouteRateLimit } from '@/lib/ratelimit/api_routes/apiRouteRateLimit';
import { getTranslations } from 'next-intl/server';

// UTILS
import { generateRandomCharacters } from '@/utils/generateRandomCharacters';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

// Expiry time for the reset token - 1 hour
const TOKEN_EXPIRATION_HOURS = 1;

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const rateLimitResult = await apiRouteRateLimit(request, 'resetPassword');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: t('PASSWORD_RESET_RATE_LIMITED') }, { status: 429 });
    }

    const { email } = await request.json();

    if (!email) {
        return NextResponse.json({ success: false, message: t('EMAIL_REQUIRED') }, { status: 400 });
    }

    // Check if the email exists in the users table
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

    if (userError || !user) {
        return NextResponse.json({ success: false, message: t('USER_NOT_FOUND') }, { status: 404 });
    }

    // Generate reset token and calculate expiry
    const resetToken = generateRandomCharacters();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000); // 1 hour from now

    // Store the reset token in the reset_password_tokens table
    const { error: tokenError } = await supabase
        .from('reset_password_tokens')
        .insert([{ email, token: resetToken, expires_at: expiresAt }]);

    if (tokenError) {
        return NextResponse.json({ success: false, message: t('PASSWORD_RESET_REQUEST_FAILED') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('PASSWORD_RESET_TOKEN_GENERATED'), token: resetToken }, { status: 200 });
}