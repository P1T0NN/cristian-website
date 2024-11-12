// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { getTranslations } from 'next-intl/server';
import { format } from 'date-fns';

// CONFIG
import { PAGE_ENDPOINTS } from '@/config';

// SERVER ACTIONS
import { checkGlobalRateLimit } from './actions/server_actions/ratelimit/checkGlobalRateLimit';

// ACTIONS
import { server_fetchUserData } from './actions/functions/data/server/server_fetchUserData';

// UTILS
import { clearAuthCookies, setAuthTokenCookie, setCsrfTokenCookie } from '@/utils/cookies/cookies';
import { refreshAccessToken } from '@/utils/auth/refreshAccessToken';

// TYPES
import type { typesUser } from '@/types/typesUser';

const PUBLIC_PAGES = [
    PAGE_ENDPOINTS.LOGIN_PAGE,
    PAGE_ENDPOINTS.REGISTER_PAGE,
    PAGE_ENDPOINTS.FORGOT_PASSWORD_PAGE,
    PAGE_ENDPOINTS.VERIFY_EMAIL_PAGE,
    PAGE_ENDPOINTS.RESET_PASSWORD_PAGE
    // Add other public pages here
];

// Define protected and admin pages
const PROTECTED_PAGES = [
    PAGE_ENDPOINTS.HOME_PAGE, 
    PAGE_ENDPOINTS.SETTINGS_PAGE
];

const ADMIN_PROTECTED_PAGES = [
    PAGE_ENDPOINTS.ADD_MATCH_PAGE,
    PAGE_ENDPOINTS.ADD_DEBT_PAGE,
    PAGE_ENDPOINTS.ADD_LOCATION_PAGE,
    PAGE_ENDPOINTS.EDIT_MATCH_PAGE,
    '/edit_match/[id]',
    PAGE_ENDPOINTS.MATCH_PAGE,
    '/match/[id]',
    PAGE_ENDPOINTS.PLAYER_PAGE,
    '/player/[id]',
    PAGE_ENDPOINTS.ADD_TEAM_PAGE,
    PAGE_ENDPOINTS.MATCH_HISTORY,
    '/match_history/[id]'
];

function getIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0];
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

// Helper functions
async function redirectToLogin(req: NextRequest) {
    return NextResponse.redirect(new URL(PAGE_ENDPOINTS.LOGIN_PAGE, req.url));
}

async function redirectToHome(req: NextRequest) {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    return NextResponse.redirect(new URL(`${PAGE_ENDPOINTS.HOME_PAGE}?date=${currentDate}`, req.url));
}

async function refreshCsrfToken() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/csrf_token`, { method: 'GET' });
    return response.ok ? (await response.json()).csrf_token : null;
}

async function refreshAuthToken(refreshToken: string, response: NextResponse): Promise<string | null> {
    const result = await refreshAccessToken(refreshToken);
    if (result && result.authToken) {
        setAuthTokenCookie(response, result.authToken);
        return result.authToken;
    }
    return null;
}

export async function middleware(req: NextRequest) {
    const genericMessages = await getTranslations("GenericMessages");

    const authToken = req.cookies.get('auth_token')?.value;
    const refreshToken = req.cookies.get('rtok')?.value;
    const csrfToken = req.cookies.get('csrftoken')?.value;
    const pathname = req.nextUrl.pathname;
    const response = NextResponse.next();

    // CSRF Token Refresh
    if (!csrfToken && !pathname.startsWith('/api/auth')) {
        const newCsrfToken = await refreshCsrfToken();
        if (newCsrfToken) {
            setCsrfTokenCookie(response, newCsrfToken);
        }
    }

    // Global Rate Limiting
    if (pathname.startsWith('/api/')) {
        const identifier = getIP(req);
        const isWithinRateLimit = await checkGlobalRateLimit(identifier);
        if (!isWithinRateLimit) {
            return new NextResponse(JSON.stringify({ message: genericMessages("RATE_LIMIT_EXCEEDED") }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const isPublicPage = PUBLIC_PAGES.includes(pathname);
    const isProtectedPage = PROTECTED_PAGES.includes(pathname) || 
                            pathname.startsWith('/match/') || 
                            pathname.startsWith('/edit_match/') ||
                            pathname.startsWith('/player/') || 
                            pathname.startsWith('/match_history/')
    const isAdminPage = ADMIN_PROTECTED_PAGES.includes(pathname);

    // Redirect authenticated users away from public pages
    if (isPublicPage && (authToken || refreshToken)) {
        return redirectToHome(req);
    }

    // Handle the home page
    if (pathname === PAGE_ENDPOINTS.HOME_PAGE) {
        const dateParam = req.nextUrl.searchParams.get('date');
        if (!dateParam) {
            // Redirect to the home page with the current date in the URL
            return redirectToHome(req);
        }
    }

    if (isProtectedPage || isAdminPage) {
        // Handle missing authToken and try to refresh
        if (!authToken && refreshToken) {
            const newAuthToken = await refreshAuthToken(refreshToken, response);
            if (newAuthToken) {
                return response;
            }
            clearAuthCookies(response);
            return redirectToLogin(req);
        }

        // Verify and decode JWT
        const verifiedToken = await jwtVerify(authToken as string, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => null);

        if (!verifiedToken) {
            clearAuthCookies(response); // Clear cookies if token is invalid
            return redirectToLogin(req); // Redirect to login
        }

        const isTokenExpired = verifiedToken.payload.exp && verifiedToken.payload.exp < Math.floor(Date.now() / 1000);

        if (isTokenExpired && refreshToken) {
            // Handle expired token
            const newAuthToken = await refreshAuthToken(refreshToken, response);
            if (newAuthToken) {
                setAuthTokenCookie(response, newAuthToken);
                return response; // Return with the new token
            }
            clearAuthCookies(response); // Clear cookies if no refresh token
            return redirectToLogin(req); // Redirect to login
        }

        // Admin Validation
        if (isAdminPage) {
            const isAdmin = await server_fetchUserData().then(result => result.success && (result.data as typesUser).isAdmin === true);
            if (!isAdmin) return redirectToHome(req); // Redirect if not admin
        }
    }

    return response; // Continue processing if everything is fine
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}