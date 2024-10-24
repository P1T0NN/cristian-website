// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function server_fetchUserData(): Promise<APIResponse> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/get_user_data`, {
        method: 'GET',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    return response.json();
}