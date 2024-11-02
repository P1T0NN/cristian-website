// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

export async function serverFetchMatch(matchId: string): Promise<typesMatchWithPlayers> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_match`, {
        method: 'POST',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
    });

    const result: APIResponse = await response.json();

    return result.data as typesMatchWithPlayers;
}