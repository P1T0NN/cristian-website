// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// LIBRARIES
import { format } from 'date-fns';
import { jwtVerify } from 'jose';

// CONFIG
import { getAllProtectedRoutes, ADMIN_PAGE_ENDPOINTS, DEFAULT_JWT_EXPIRATION_TIME, PROTECTED_PAGE_ENDPOINTS } from './config';

// ACTIONS
import { verifyAuthWithRefresh } from '@/actions/actions/auth/verifyAuth';

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

        // We cannot use verifyToken util function. It gives some headers error, instead we have to directly use jwtVerify.
        // const payload = await verifyToken(authToken as string);

        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
        const { payload } = await jwtVerify(validToken, secretKey, {
            algorithms: ['HS256']
        });

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