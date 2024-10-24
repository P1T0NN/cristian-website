// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function client_fetchUsers(authToken: string, searchTerm: string): Promise<APIResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/debt/search_users?search=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
    });

    return response.json();
}