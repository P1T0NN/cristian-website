// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// UTILS
import { generateRandomCharacters } from '@/utils/generateRandomCharacters';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export type CSRFTokenResponse = APIResponse & {
    csrf_token?: string;
};

export async function GET(): Promise<NextResponse<CSRFTokenResponse>> {
    const t = await getTranslations('GenericMessages');

    const csrf_token = generateRandomCharacters();

    // Check if the token is valid
    if (!csrf_token) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_GET_CSRF_TOKEN') }, { status: 500 });
    }

    return NextResponse.json(
        { success: true, message: t('CSRF_TOKEN_GENERATED'), csrf_token },
        {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache',
                'X-Content-Type-Options': 'nosniff',
            },
        }
    );
}

// Prevent caching of this route
export const dynamic = 'force-dynamic';