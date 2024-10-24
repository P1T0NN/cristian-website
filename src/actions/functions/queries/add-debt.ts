// UTILS
import { logError, logInfo } from '@/utils/logging/logger';

// TYPES
import type { typesAddDebtForm } from '@/types/forms/AddDebtForm';

export async function addDebt(addDebtData: typesAddDebtForm) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/debt/add_debt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(addDebtData),
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        logError('addDebt', 'DEBT_CREATION_FAILED', { status: response.status, error: data.message });
        return { success: false, message: data.message };
    }

    logInfo('Debt added successfully', { debtData: data });
    return { success: true, message: data.message, data };
}