// TYPES
import type { APIResponse } from "@/types/responses/APIResponse";

export async function clientFetchDefaultLocations(authToken: string): Promise<APIResponse> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/fetch_default_locations`, {
        method: 'GET',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
        }
    });

    return response.json();
}