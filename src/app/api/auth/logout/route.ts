// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// UTILS
import { clearAuthCookies } from '@/utils/cookies/cookies';
import { GenericMessages } from '@/utils/genericMessages';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('rtok')?.value;
        const csrfToken = cookieStore.get('csrftoken')?.value;

        if (!csrfToken) {
            return NextResponse.json({ message: GenericMessages.MISSING_CSRF_TOKEN }, { status: 403 });
        }

        if (refreshToken) {
            await fetch(`${process.env.NEXT_PUBLIC_ELIXIR_BACKEND_URL}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
        }

        // Create a response object
        const response = NextResponse.json({ message: GenericMessages.LOGOUT_SUCCESSFUL }, { status: 200 });

        // Clear cookies after successful backend logout
        clearAuthCookies(response);

        return response;
    } catch {
        return NextResponse.json({ message: GenericMessages.UNKNOWN_ERROR }, { status: 500 });
    }
}