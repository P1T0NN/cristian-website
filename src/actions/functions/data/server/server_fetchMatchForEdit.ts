// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

export async function serverFetchMatchForEdit(matchId: string): Promise<typesMatch> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_match_for_edit`, {
        method: 'POST',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
    });

    const result = await response.json();

    return result.data;
}