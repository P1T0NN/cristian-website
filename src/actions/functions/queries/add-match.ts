// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

// TYPES
import type { typesAddMatchForm } from "@/types/forms/AddMatchForm";

export async function addMatch(addMatchData: typesAddMatchForm) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/add_match`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addMatchData),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('addMatch', 'MATCH_CREATION_FAILED', { status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Match added successfully', { matchData: data });
    return { success: true, message: data.message, data };
}