// UTILS
import { encrypt } from "@/utils/encryption";

// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function clientFetchUserIdByName(authToken: string, playerName: string): Promise<APIResponse> {
    const encryptedPlayerName = encrypt(playerName);
    const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/fetch_user_id_by_name?playerName=${encodeURIComponent(encryptedPlayerName)}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });

    const result = await response.json();

    return { success: true, message: result.message, data: result.data.id };
}