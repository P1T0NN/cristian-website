// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// LIBRARIES
import { format } from 'date-fns';
import { jwtVerify, SignJWT } from 'jose';
import { supabase } from './lib/supabase/supabase';

// CONFIG
import { getAllProtectedRoutes, PUBLIC_PAGE_ENDPOINTS, ADMIN_PAGE_ENDPOINTS, DEFAULT_JWT_EXPIRATION_TIME, PROTECTED_PAGE_ENDPOINTS } from './config';

async function redirectToHome(req: NextRequest) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    return NextResponse.redirect(new URL(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}?date=${currentDate}`, req.url));
}

async function generateFingerprint(userId: string, request: NextRequest): Promise<string> {
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown';

    const data = `${userId}-${userAgent}-${ipAddress}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateToken(userId: string, isAdmin: boolean, hasAccess: boolean, request: NextRequest): Promise<string> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const fingerprint = await generateFingerprint(userId, request);
    
    const now = Math.floor(Date.now() / 1000);
    
    return new SignJWT({ 
        sub: userId,
        isAdmin,
        has_access: hasAccess
    })
        .setProtectedHeader({ alg: 'HS256', fingerprint })
        .setIssuedAt(now)
        .setExpirationTime(now + DEFAULT_JWT_EXPIRATION_TIME)
        .sign(secretKey);
}

async function refreshAuthToken(refreshToken: string, request: NextRequest) {
    const { data: tokenData, error: tokenError } = await supabase
        .from('refresh_tokens')
        .select('user_id')
        .eq('token', refreshToken)
        .single();

    if (tokenError || !tokenData) {
        return { success: false };
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin, has_access')
        .eq('id', tokenData.user_id)
        .single();

    if (userError || !userData) {
        return { success: false };
    }

    const newAuthToken = await generateToken(tokenData.user_id, userData.isAdmin, userData.has_access, request);

    return { 
        success: true, 
        isAuth: true, 
        userId: tokenData.user_id,
        newAuthToken
    };
}

export async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const path = request.nextUrl.pathname;

    const isPublicRoute = Object.values(PUBLIC_PAGE_ENDPOINTS).some(route => path === route);
    const isProtectedRoute = getAllProtectedRoutes().some(route => path.startsWith(route));
    const isAdminRoute = Object.values(ADMIN_PAGE_ENDPOINTS).some(route => path.startsWith(route));

    if (path === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicRoute && (authToken || refreshToken)) {
        return redirectToHome(request);
    }

    if (path === PROTECTED_PAGE_ENDPOINTS.HOME_PAGE) {
        const dateParam = request.nextUrl.searchParams.get('date');
        if (!dateParam) {
            return redirectToHome(request);
        }
    }

    if (isProtectedRoute) {
        let validToken = authToken;

        if (!authToken && refreshToken) {
            const result = await refreshAuthToken(refreshToken, request);
            const response = NextResponse.next();

            if (!result.success) {
                response.cookies.delete('refresh_token');
                return NextResponse.redirect(new URL('/login', request.url));
            }

            if (result.newAuthToken) {
                validToken = result.newAuthToken;
                response.cookies.set('auth_token', result.newAuthToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: DEFAULT_JWT_EXPIRATION_TIME,
                    path: '/'
                });
            } else {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return response;
        }

        if (!validToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
        const { payload } = await jwtVerify(validToken, secretKey, {
            algorithms: ['HS256']
        }).catch(() => ({ payload: null }));

        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Check user access
        if (!payload.has_access) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // Check admin route access
        if (isAdminRoute && !payload.isAdmin) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}