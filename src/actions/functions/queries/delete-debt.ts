// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

export async function deleteDebt(debtId: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/debt/delete_debt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ debtId }),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('deleteDebt', 'DEBT_DELETION_FAILED', { debtId, status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Debt deleted successfully', { debtId, deletedDebtData: data });
    return { success: true, message: data.message, data };
}