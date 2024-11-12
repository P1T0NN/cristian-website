// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function serverFetchAdminMatchHistory(): Promise<APIResponse> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;


    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_match_history`, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
    });

    return response.json();
}