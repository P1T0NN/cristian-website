// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// LIBRARIES
import { format } from 'date-fns';

// CONFIG
import { getAllProtectedRoutes, ADMIN_PAGE_ENDPOINTS, DEFAULT_JWT_EXPIRATION_TIME, PROTECTED_PAGE_ENDPOINTS } from './config';

// UTILS
import { verifyToken } from './utils/auth/jwt';

async function redirectToHome(req: NextRequest) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    return NextResponse.redirect(new URL(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}?date=${currentDate}`, req.url));
}

export async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const path = request.nextUrl.pathname;

    const isProtectedRoute = getAllProtectedRoutes().some(route => path.startsWith(route));
    const isAdminRoute = Object.values(ADMIN_PAGE_ENDPOINTS).some(route => path.startsWith(route));

    if (path === PROTECTED_PAGE_ENDPOINTS.HOME_PAGE) {
        const dateParam = request.nextUrl.searchParams.get('date');
        if (!dateParam) {
            return redirectToHome(request);
        }
    }

    if (isProtectedRoute) {
        // If no auth token, try to refresh
        if (!authToken && refreshToken) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/verify_auth_with_refresh`);
            const result = await res.json();

            if (!result.isAuth) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            if (result.newAuthToken) {
                const response = NextResponse.next();
                response.cookies.set('auth_token', result.newAuthToken, {
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

        try {
            // Verify the token and extract payload directly
            const payload = await verifyToken(authToken);

            // Check user access
            if (!payload.has_access) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            // Check admin route access
            if (isAdminRoute && !payload.isAdmin) {
                return NextResponse.redirect(new URL('/home', request.url));
            }
        } catch {
            // Token verification failed
            return NextResponse.redirect(new URL('/login', request.url));
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