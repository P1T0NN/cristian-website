// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
    path: string;
}

const defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // This will be overwritten in specific functions
};

export function setAuthTokenCookie(res: NextResponse, token: string): void {
    res.cookies.set('auth_token', token, {
        ...defaultOptions,
        maxAge: 30 * ONE_MINUTE, // 30 minutes
    });
}

export function setRefreshTokenCookie(res: NextResponse, token: string): void {
    res.cookies.set('rtok', token, {
        ...defaultOptions,
        maxAge: 7 * ONE_DAY, // 7 days
    });
}

export function setCsrfTokenCookie(res: NextResponse, token: string): void {
    res.cookies.set('csrftoken', token, {
        ...defaultOptions,
        httpOnly: false, // CSRF token needs to be accessible by JavaScript
        sameSite: 'lax', // This is 'lax' for better compatibility with form submissions
        maxAge: 365 * ONE_DAY, // 1 year
    });
}

export function clearAuthCookies(res: NextResponse): void {
    res.cookies.delete('auth_token');
    res.cookies.delete('rtok');
    res.cookies.delete('csrftoken');
}