// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const checkTokenValidity = (expiresAt: string): boolean => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    return expiryDate > now;
};

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations('GenericMessages');

    const requestBody = await req.json();
    const { token } = requestBody;

    // Validate token presence
    if (!token) {
        return NextResponse.json({ success: false, message: t('INVALID_RESET_PASSWORD_TOKEN') }, { status: 400 });
    }

    const { data: tokenData, error: tokenError } = await supabase
        .from('reset_password_tokens')
        .select('email, expires_at')
        .eq('token', token)
        .single();

    // Check if the token is valid or if there was an error fetching it
    if (tokenError || !tokenData) {
        return NextResponse.json({ success: false, message: t('INVALID_RESET_PASSWORD_TOKEN') }, { status: 400 });
    }

    // Check if the token has expired
    const isValidToken = checkTokenValidity(tokenData.expires_at);
    if (!isValidToken) {
        return NextResponse.json({ success: false, message: t('INVALID_RESET_PASSWORD_TOKEN') }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: t('RESET_PASSWORD_TOKEN_VALID'), email: tokenData.email }, { status: 200 });
}