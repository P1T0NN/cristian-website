// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function serverFetchMatches(gender: string, isAdmin: boolean, playerLevel: string, date?: string): Promise<APIResponse> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_matches`);
    
    if (date) {
        url.searchParams.append('date', date);
    }

    if (gender !== undefined) {
        url.searchParams.append('gender', gender);
    }

    if (isAdmin !== undefined) {
        url.searchParams.append('isAdmin', isAdmin.toString());
    }

    if (playerLevel) {
        url.searchParams.append('playerLevel', playerLevel);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
    });

    return response.json();
}