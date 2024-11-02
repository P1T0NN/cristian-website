// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { apiRouteRateLimit } from '@/lib/ratelimit/api_routes/apiRouteRateLimit';

// UTILS
import { clearAuthCookies } from '@/utils/cookies/cookies';
import { GenericMessages } from '@/utils/genericMessages';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const rateLimitResult = await apiRouteRateLimit(request, 'logout');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: t('LOGOUT_RATE_LIMIT') }, { status: 429 });
    }

    const cookieStore = await cookies();
    const csrfToken = cookieStore.get('csrftoken')?.value;

    if (!csrfToken) {
        return NextResponse.json({ success: false, message: GenericMessages.MISSING_CSRF_TOKEN }, { status: 403 });
    }

    const response = NextResponse.json({ success: true, message: t('LOGOUT_SUCCESSFUL') }, { status: 200 });

    // Clear cookies
    clearAuthCookies(response);

    return response;
}