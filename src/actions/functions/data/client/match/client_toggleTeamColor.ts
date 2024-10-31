// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export const client_toggleTeamColor = async (
    authToken: string,
    matchId: string,
    teamNumber: 1 | 2
): Promise<APIResponse> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/toggle_color`,
        {
            method: 'POST',
            headers: {
                'Authorization': authToken ? `Bearer ${authToken}` : '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matchId, teamNumber })
        }
    );

    const result = await response.json();
    return result;
};