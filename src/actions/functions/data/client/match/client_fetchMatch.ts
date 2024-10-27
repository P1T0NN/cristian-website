// TYPES
import { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

export const client_fetchMatch = async (authToken: string, matchId: string): Promise<typesMatchWithPlayers> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_match`, {
        method: 'POST',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matchId })
    });

    const result = await response.json();

    return result.data;
};