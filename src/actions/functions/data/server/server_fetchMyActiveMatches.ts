// NEXTJS IMPORTS
import { cookies } from "next/headers";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";
import type { typesMatch } from "@/types/typesMatch";

export async function serverFetchMyActiveMatches(userId: string): Promise<APIResponse<typesMatch[]>> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/fetch_my_active_matches`);
    url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
    });

    return response.json();
}