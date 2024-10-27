// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

export async function editMatch(matchId: string, editMatchData: typesAddMatchForm) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/edit_match`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            matchId,
            ...editMatchData
        }),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('editMatch', 'MATCH_EDIT_FAILED', { matchId, status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Match updated successfully', { matchId, editMatchData: data });
    return { success: true, message: data.message, data };
}