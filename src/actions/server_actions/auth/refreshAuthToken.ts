'use server'

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// CONFIG
import { DEFAULT_JWT_EXPIRATION_TIME } from '@/config';

// UTILS
import { generateToken } from '@/utils/auth/jwt';

// I didnt put APIResponse here as return type, because we need to return more data and specific boolean
export async function refreshAuthToken(refreshToken: string) {
    const t = await getTranslations('GenericMessages');
    const cookieStore = await cookies();

    const { data: tokenData, error } = await supabase
        .from('refresh_tokens')
        .select('user_id')
        .eq('token', refreshToken)
        .single()

    if (error || !tokenData) {
        cookieStore.delete('refresh_token');
        return { success: false, message: t('INVALID_REFRESH_TOKEN') };
    };

    const newAuthToken = await generateToken(tokenData.user_id)

    cookieStore.set('auth_token', newAuthToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: DEFAULT_JWT_EXPIRATION_TIME,
        path: '/'
    });

    return { 
        success: true, 
        isAuth: true, 
        userId: tokenData.user_id,
        newAuthToken
    };
}