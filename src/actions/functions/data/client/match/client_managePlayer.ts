export const client_managePlayer = async (
    authToken: string,
    matchId: string,
    userId: string,
    teamNumber: 1 | 2,
    action: 'join' | 'leave'
): Promise<void> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/manage_player`,
        {
            method: 'POST',
            headers: {
                'Authorization': authToken ? `Bearer ${authToken}` : '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ matchId, userId, teamNumber, action })
        }
    );

    const result = await response.json();

    return result.data;
};