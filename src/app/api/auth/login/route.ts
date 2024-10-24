// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import argon2 from 'argon2';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// ACTIONS
import { resendVerificationEmail } from '@/actions/functions/auth/auth';

// UTILS
import { getTranslations } from 'next-intl/server';
import { getUserByEmail } from '@/utils/supabase/supabaseUtils';
import { setAuthTokenCookie, setRefreshTokenCookie, setCsrfTokenCookie } from '@/utils/cookies/cookies';
import { generateAuthTokens } from '@/utils/auth/generateAuthTokens';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesLoginUser } from '@/types/typesUser';

interface ExtendedUser extends typesLoginUser {
    id: string;
}

interface GetUserResponse {
    user: ExtendedUser | null;
    error: unknown;
}

interface LoginAPIResponse extends APIResponse {
    user?: ExtendedUser;
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginAPIResponse>> {
    const t = await getTranslations('GenericMessages');

    const rateLimitResult = await applyRateLimit(request, 'login');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: t('LOGIN_RATE_LIMIT') }, { status: 429 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json({ success: false, message: t('INVALID_LOGIN') }, { status: 400 });
    }

    const { user, error } = await getUserByEmail(email) as GetUserResponse;
    if (error || !user) {
        return NextResponse.json({ success: false, message: t('INVALID_LOGIN') }, { status: 401 });
    }

    // Now we can check if the user is verified
    if (!user.is_verified) {
        const resendResult = await resendVerificationEmail(email, user.id);

        // Check for rate limit response first
        if (resendResult.status === 429) {
            return NextResponse.json({ success: false, message: t('ACCOUNT_NOT_VERIFIED_RATE_LIMIT') }, { status: 429 });
        }

        // If the resend was not successful due to some other reason
        if (!resendResult.success) {
            return NextResponse.json({ success: false, message: resendResult.message || t('UNKNOWN_ERROR') }, { status: 500 });
        }

        return NextResponse.json({ success: false, message: t('ACCOUNT_NOT_VERIFIED_RESENT') }, { status: 403 });
    }

    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
        return NextResponse.json({ success: false, message: t('INVALID_LOGIN') }, { status: 401 });
    }

    const tokensResult = await generateAuthTokens(user.id);
    if (!tokensResult.success) {
        return NextResponse.json({ success: false, message: tokensResult.message || t('UNKNOWN_ERROR') }, { status: 500 });
    }

    const { accessToken, refreshToken, csrfToken } = tokensResult;
    const response = NextResponse.json({ success: true, message: t('LOGIN_SUCCESSFUL'), user }, { status: 200 });

    setAuthTokenCookie(response, accessToken as string);
    setRefreshTokenCookie(response, refreshToken as string);
    setCsrfTokenCookie(response, csrfToken as string);

    return response;
}