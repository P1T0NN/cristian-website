// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// CONFIG
import { DEFAULT_JWT_EXPIRATION_TIME } from '@/config';

// ACTIONS
import { refreshAuthToken } from '@/actions/server_actions/auth/refreshAuthToken';
import { verifyAuth } from '@/actions/actions/auth/verifyAuth'; // Adjust import path as needed

export async function GET() {
    const cookieStore = await cookies();

    const authToken = cookieStore.get('auth_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!authToken && !refreshToken) {
        return NextResponse.json({ isAuth: false, redirectTo: '/login' }, { status: 401 });
    }

    if (authToken) {
        const result = await verifyAuth(authToken);
        if (result.isAuth) {
            return NextResponse.json(result);
        }
    }

    if (refreshToken) {
        const refreshResult = await refreshAuthToken(refreshToken);
    
        if (!refreshResult.success) {
            cookieStore.delete('refresh_token');
            return NextResponse.json({ isAuth: false, redirectTo: '/login' }, { status: 401 });
        }
    
        // Check if newAuthToken exists before setting the cookie
        if ('newAuthToken' in refreshResult && refreshResult.newAuthToken) {
            const response = NextResponse.json({ 
                isAuth: refreshResult.isAuth, 
                userId: refreshResult.userId,
                newAuthToken: refreshResult.newAuthToken 
            });
    
            response.cookies.set({
                name: 'auth_token',
                value: refreshResult.newAuthToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: DEFAULT_JWT_EXPIRATION_TIME,
                path: '/'
            });
    
            return response;
        }
    }

    return NextResponse.json({ isAuth: false, redirectTo: '/login' }, { status: 401 });
}