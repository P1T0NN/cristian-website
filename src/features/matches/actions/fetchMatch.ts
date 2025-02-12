// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesMatch } from "../types/typesMatch";

interface MatchResponse {
    success: boolean;
    message?: string;
    data?: typesMatch;
}

export const fetchMatch = cache(async (matchId: string, userId?: string): Promise<MatchResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!matchId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: typesMatch }>({
        endpoint: '/api/data/match/fetch_match',
        method: 'GET',
        queryParams: { matchId, userId: userId || '' },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('MATCH_FAILED_TO_FETCH'),
            notFound: t('MATCH_NOT_FOUND'),
            serverError: t('UNKNOWN_ERROR')
        },
    });

    if (!response.success) {
        return { success: false, message: response.message };
    }

    return { success: true, data: response.data?.data };
});