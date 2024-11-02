// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export const client_fetchUser = async (authToken: string, playerId: string): Promise<APIResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/fetch_user`, {
        method: 'POST',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerId })
    });

    const result = await response.json();

    return result;
};