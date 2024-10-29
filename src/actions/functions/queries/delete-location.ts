import { APIResponse } from '@/types/responses/APIResponse';

export const deleteLocation = async (locationId: number): Promise<APIResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/delete_location`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId }),
    });

    const result: APIResponse = await response.json();

    return result;
};