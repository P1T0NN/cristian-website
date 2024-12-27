"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { UpstashRateLimiter } from '@/lib/ratelimit/upstash';

// CONFIG
import { DEFAULT_JWT_EXPIRATION_TIME, DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME } from '@/config';

// SERVER ACTIONS
import { sendVerificationEmail } from './sendVerificationEmail';

// UTILS
import { verifyPassword } from '@/utils/argon2';
import { generateToken } from '@/utils/auth/jwt';
import { generateRefreshToken } from '@/utils/auth/auth-utils';

const rateLimiter = new UpstashRateLimiter({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
    points: 1,  // Allow 3 attempts
    duration: 5 * 60 * 1000,  // in 5 minutes
    blockDuration: 15 * 60 * 1000,  // Block for 15 minutes after exceeding limit
});

async function resendVerificationEmail(email: string) {
    const t = await getTranslations('GenericMessages');

    const rateLimitResult = await rateLimiter.limit(`resend_verification_email:${email}`);

    if (!rateLimitResult.success) {
        return {
            success: false,
            message: t('LOGIN_RATE_LIMIT', { seconds: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) }),
            data: {
                retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            }
        };
    }

    const result = await sendVerificationEmail(email);
    
    if (!result.success) {
        return { success: false, message: t('email_VerificationError') };
    }

    return { success: true, message: t('email_VerificationSent') };
}

export async function loginUser(email: string, password: string) {
    const t = await getTranslations('GenericMessages');

    if (!email || !password) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !user) {
        return { success: false, message: t('INVALID_CREDENTIALS') };
    }

    const validPassword = await verifyPassword(user.password, password);
    if (!validPassword) {
        return { success: false, message: t('INVALID_CREDENTIALS') };
    }

    if (!user.is_verified) {
        const resendResult = await resendVerificationEmail(user.email);
        if (!resendResult.success) {
            return resendResult;
        }
        return { success: false, message: t('EMAIL_NOT_VERIFIED') };
    }

    const token = await generateToken(user.id, user.isAdmin, user.has_access);
    const refreshToken = generateRefreshToken();

    const { data: existingToken, error: existingTokenError } = await supabase
        .from('refresh_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (existingTokenError && existingTokenError.code !== 'PGRST116') {
        return { success: false, message: t('UNKNOWN_ERROR') };
    }

    if (existingToken) {
        const { error: deleteError } = await supabase
            .from('refresh_tokens')
            .delete()
            .eq('id', existingToken.id);

        if (deleteError) {
            return { success: false, message: t('UNKNOWN_ERROR') };
        }
    }

    const { error: refreshTokenError } = await supabase
        .from('refresh_tokens')
        .insert({ user_id: user.id, token: refreshToken, expires_at: new Date(Date.now() + DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME) });

    if (refreshTokenError) {
        return { success: false, message: t('REFRESH_TOKEN_ERROR') };
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: DEFAULT_JWT_EXPIRATION_TIME,
        path: '/'
    });
    cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: DEFAULT_REFRESH_TOKEN_EXPIRATION_TIME,
        path: '/'
    });

    return {
        success: true,
        message: t('LOGIN_SUCCESSFUL'),
        data: {
            user,
            token
        }
    };
}