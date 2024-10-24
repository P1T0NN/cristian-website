// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// UTILS
import { generateJWT } from '@/utils/auth/jwt/jwtUtils';

export async function POST(req: Request) {
    const t = await getTranslations('GenericMessages');

    const { refreshToken } = await req.json();

    if (!refreshToken) {
        return NextResponse.json({ success: false, message: t('REFRESH_TOKEN_NOT_FOUND') }, { status: 400 });
    }

    // Get the refresh token from the database
    const { data: tokenData, error } = await supabase
        .from('refresh_tokens')
        .select('user_id, expires_at')
        .eq('refresh_token', refreshToken)
        .single();

    if (error || !tokenData) {
        return NextResponse.json({ success: false, message: t('REFRESH_TOKEN_INVALID') }, { status: 401 });
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
        // Delete expired token
        await supabase
            .from('refresh_tokens')
            .delete()
            .eq('refresh_token', refreshToken);

        return NextResponse.json({ success: false, message: t('REFRESH_TOKEN_SESSION_EXPIRED') }, { status: 401 });
    }

    const newAuthToken = await generateJWT(tokenData.user_id);

    return NextResponse.json({ success: true, authToken: newAuthToken });
}