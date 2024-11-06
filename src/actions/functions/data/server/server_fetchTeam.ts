// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function serverFetchTeam(teamId: string): Promise<APIResponse> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/team/fetch_team?teamId=${encodeURIComponent(teamId)}`, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensures fresh data is always fetched
    });

    return response.json();
}