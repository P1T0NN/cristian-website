// TYPES
import type { APIResponse } from "@/types/responses/APIResponse"

export async function editMatchInstructions(
    authToken: string,
    matchId: string,
    instructions: string
): Promise<APIResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/edit_match_instructions`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
            matchId,
            instructions
        })
    })

    const data = await response.json()

    return data;
}