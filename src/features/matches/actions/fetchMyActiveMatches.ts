// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesMatch } from "../types/typesMatch";

interface MyActiveMatchesResponse {
    success: boolean;
    message?: string;
    data?: typesMatch[];
}

export const fetchMyActiveMatches = cache(async (userId: string): Promise<MyActiveMatchesResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: typesMatch[] }>({
        endpoint: '/api/data/user/fetch_my_active_matches',
        method: 'GET',
        queryParams: { userId },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('ACTIVE_MATCHES_FAILED_TO_FETCH')
        }
    });

    if (!response.success) {
        return { success: false, message: response.message };
    }

    return { success: true, data: response.data?.data };
});

