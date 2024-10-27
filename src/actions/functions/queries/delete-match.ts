// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

export async function deleteMatch(matchId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/delete_match`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId }),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('deleteMatch', 'MATCH_DELETION_FAILED', { status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Match deleted successfully', { matchId });
    return { success: true, message: data.message };
}