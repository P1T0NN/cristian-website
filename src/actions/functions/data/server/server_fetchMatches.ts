// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function serverFetchMatches(date?: string): Promise<APIResponse> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_matches`);
    
    if (date) {
        url.searchParams.append('date', date);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
    });

    return response.json();
}