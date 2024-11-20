// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CONFIG
import { getAllProtectedRoutes, ADMIN_PAGE_ENDPOINTS, DEFAULT_JWT_EXPIRATION_TIME } from './config';

// SERVER ACTIONS
import { checkIfUserIsAdmin } from './actions/server_actions/auth/checkIfUserIsAdmin';

// ACTIONS
import { verifyAuthWithRefresh } from '@/actions/actions/auth/verifyAuth';

export async function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const path = request.nextUrl.pathname;

    const isProtectedRoute = getAllProtectedRoutes().some(route => path.startsWith(route));
    const isAdminRoute = Object.values(ADMIN_PAGE_ENDPOINTS).some(route => path.startsWith(route));

    if (isProtectedRoute) {
        let validToken = authToken;

        if (!authToken && refreshToken) {
            const result = await verifyAuthWithRefresh();

            if (!result.isAuth) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            if ('newAuthToken' in result && result.newAuthToken) {
                validToken = result.newAuthToken;
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

        if (!validToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isAdminRoute) {
            const isAdmin = await checkIfUserIsAdmin(validToken);
            if (!isAdmin) {
                return NextResponse.redirect(new URL('/home', request.url));
            }
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