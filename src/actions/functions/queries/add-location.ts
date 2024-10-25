// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

// TYPES
import type { typesAddLocationForm } from '@/types/forms/AddLocationForm';

export async function addLocation(addLocationData: typesAddLocationForm) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/add_location`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addLocationData),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('addLocation', 'LOCATION_CREATION_FAILED', { status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Location added successfully!', { locationData: data });
    return { success: true, message: data.message, data };
}