// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesLocation } from '@/types/typesLocation';

export const client_fetchLocations = async (): Promise<typesLocation[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/fetch_locations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const result: APIResponse = await response.json();

    return result.data as typesLocation[];
};