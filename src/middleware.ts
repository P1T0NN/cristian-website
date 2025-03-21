// NEXTJS IMPORTS
import { NextResponse, type NextRequest } from 'next/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from './config';

// UTILS
import { getCurrentDateString } from '@/shared/utils/dateUtils';

async function redirectToHome(req: NextRequest) {
    const currentDate = getCurrentDateString();
    return NextResponse.redirect(new URL(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}?date=${currentDate}`, req.url));
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (path === PROTECTED_PAGE_ENDPOINTS.HOME_PAGE) {
        const dateParam = request.nextUrl.searchParams.get('date');
        if (!dateParam) {
            return redirectToHome(request);
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