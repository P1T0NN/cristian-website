// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function serverFetchCurrentUserMatchAdmin(matchId: string): Promise<APIResponse> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_current_user_match_admin?matchId=${matchId}`, {
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
    });

    const result: APIResponse = await response.json();
    return {
        success: result.success,
        message: result.message,
        data: result.data
    };
}