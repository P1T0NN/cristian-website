// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

export async function updateUserFullName(authToken: string, fullName: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/update_user_full_name`, {
        method: 'POST',
        headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName }),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('updateUserFullName', 'USER_UPDATE_FAILED', { status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('User full name updated successfully', { userData: data });
    return { success: true, message: data.message, data: data.data };
}