// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// UTILS
import { clearAuthCookies } from '@/utils/cookies/cookies';
import { GenericMessages } from '@/utils/genericMessages';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

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