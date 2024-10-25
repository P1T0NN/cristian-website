// TYPES
import type { typesMatch } from "@/types/typesMatch";

export const client_fetchMatches = async (authToken: string): Promise<typesMatch[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_matches`, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
    });

    const result = await response.json();

    return result.data;
};