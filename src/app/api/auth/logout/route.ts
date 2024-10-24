// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// UTILS
import { clearAuthCookies } from '@/utils/cookies/cookies';
import { GenericMessages } from '@/utils/genericMessages';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('rtok')?.value;
        const csrfToken = cookieStore.get('csrftoken')?.value;

        if (!csrfToken) {
            return NextResponse.json({ message: GenericMessages.MISSING_CSRF_TOKEN }, { status: 403 });
        }

        if (refreshToken) {
            const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_ELIXIR_BACKEND_URL}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!backendResponse.ok) {
                return NextResponse.json({ message: GenericMessages.BACKEND_LOGOUT_FAILED }, { status: 500 });
            }
        }

        // Create a response object
        const response = NextResponse.json({ message: GenericMessages.LOGOUT_SUCCESSFUL }, { status: 200 });

        // Clear cookies after successful backend logout
        clearAuthCookies(response);

        return response;
    } catch (error) {
        return NextResponse.json({ message: GenericMessages.UNKNOWN_ERROR }, { status: 500 });
    }
}