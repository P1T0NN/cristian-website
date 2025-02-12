// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesMatch } from "../types/typesMatch";

interface MatchForEditResponse {
    success: boolean;
    message?: string;
    data?: typesMatch;
}

export const fetchMatchForEdit = cache(async (matchId: string): Promise<MatchForEditResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!matchId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: typesMatch }>({
        endpoint: '/api/data/match/fetch_match_for_edit',
        method: 'GET',
        queryParams: { matchId },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('MATCH_FAILED_TO_FETCH')
        }
    });

    if (!response.success) {
        return { success: false, message: response.message };
    }

    return { success: true, data: response.data?.data };
});