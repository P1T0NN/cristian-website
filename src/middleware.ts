// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// CONFIG
import { PAGE_ENDPOINTS } from '@/config';

// ACTIONS
import { server_fetchUserData } from './actions/functions/data/server/server_fetchUserData';

// UTILS
import { clearAuthCookies, setAuthTokenCookie, setCsrfTokenCookie } from '@/utils/cookies/cookies';
import type { typesUser } from '@/types/typesUser';

const PROTECTED_PAGES = [
    PAGE_ENDPOINTS.HOME_PAGE,
    PAGE_ENDPOINTS.SETTINGS_PAGE
];

const ADMIN_PROTECTED_PAGES = [
    PAGE_ENDPOINTS.ADD_MATCH_PAGE,
    PAGE_ENDPOINTS.ADD_DEBT_PAGE,
    PAGE_ENDPOINTS.ADD_LOCATION_PAGE,
    PAGE_ENDPOINTS.EDIT_MATCH_PAGE
]

async function redirectToLogin(req: NextRequest) {
    const loginUrl = new URL(PAGE_ENDPOINTS.LOGIN_PAGE, req.url);
    return NextResponse.redirect(loginUrl);
}

async function redirectToHome(req: NextRequest) {
    const homeUrl = new URL(PAGE_ENDPOINTS.HOME_PAGE, req.url);
    return NextResponse.redirect(homeUrl);
}

async function validateAuthToken(authToken: string) {
    try {
        const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/verify_jwt`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const verificationResult = await verifyResponse.json();
        return verificationResult.success;
    } catch {
        return false;
    }
}

async function validateAdminStatus(): Promise<boolean> {
    const result = await server_fetchUserData();
    
    if (!result.success) {
        return false;
    }

    const userData = result.data as typesUser;

    return userData.isAdmin === true;
}

async function refreshCsrfToken(): Promise<string | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/csrf_token`, {
        method: 'GET',
    });

    if (response.ok) {
        const data = await response.json();
        return data.csrf_token;
    }

    return null;
}

async function refreshAuthToken(refreshToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/refresh_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
        const data = await response.json();
        return data.authToken;
    }

    return null;
}

export async function middleware(req: NextRequest) {
    const authToken = req.cookies.get('auth_token')?.value;
    const refreshToken = req.cookies.get('rtok')?.value;
    const csrfToken = req.cookies.get('csrftoken')?.value;

    const pathname = req.nextUrl.pathname;

    const response = NextResponse.next();

    // CSRF token handling (unchanged)
    if (!csrfToken && !req.nextUrl.pathname.startsWith('/api/auth')) {
        const newCsrfToken = await refreshCsrfToken();
        if (newCsrfToken) {
            setCsrfTokenCookie(response, newCsrfToken);
        }
    }

    // Check if it's an admin page
    const isAdminPage = ADMIN_PROTECTED_PAGES.includes(pathname);
    
    // Combined protected pages check
    if (PROTECTED_PAGES.includes(pathname) || isAdminPage) {
        // Handle missing auth token with refresh token
        if (!authToken && refreshToken) {
            const newAuthToken = await refreshAuthToken(refreshToken);
            if (newAuthToken) {
                setAuthTokenCookie(response, newAuthToken);
                return response;
            }
        }

        // Handle missing refresh token
        if (!refreshToken) {
            clearAuthCookies(response);
            return redirectToLogin(req);
        }

        // Handle missing auth token
        if (!authToken) {
            return redirectToLogin(req);
        }

        // Validate auth token
        if (!(await validateAuthToken(authToken))) {
            clearAuthCookies(response);
            return redirectToLogin(req);
        }

        // Additional admin check for admin pages
        if (isAdminPage) {
            const isAdmin = await validateAdminStatus();
            if (!isAdmin) {
                return redirectToHome(req);
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/home', 
        '/settings',
        '/add_match',
        '/add_debt',
        '/add_location',
        '/edit_match/:path*'
    ],
};