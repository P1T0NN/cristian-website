// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// LIBRARIES
import { format } from 'date-fns';
import { jwtVerify } from 'jose';

// CONFIG
import { getAllProtectedRoutes, PUBLIC_PAGE_ENDPOINTS, ADMIN_PAGE_ENDPOINTS, DEFAULT_JWT_EXPIRATION_TIME, PROTECTED_PAGE_ENDPOINTS } from './config';

async function redirectToHome(req: NextRequest) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    return NextResponse.redirect(new URL(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}?date=${currentDate}`, req.url));
}

async function refreshAuthToken(refreshToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/refresh_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (!response.ok) {
        return { success: false };
    }

    return result;
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
        if (!authToken && refreshToken) {
            const result = await refreshAuthToken(refreshToken);
    
            if (!result.success) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('refresh_token');
                return response;
            }
    
            if (result.data && result.data.newAuthToken) {
                const response = NextResponse.next();
                response.cookies.set('auth_token', result.data.newAuthToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: DEFAULT_JWT_EXPIRATION_TIME,
                    path: '/'
                });
                return response;
            }
        }

        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
        try {
            const { payload } = await jwtVerify(authToken, secretKey, {
                algorithms: ['HS256']
            });

            if (!payload.has_access) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            if (isAdminRoute && !payload.isAdmin) {
                return NextResponse.redirect(new URL('/home', request.url));
            }
        } catch {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
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