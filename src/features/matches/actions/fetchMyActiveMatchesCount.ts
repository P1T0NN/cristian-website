// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

interface ActiveMatchesCountResponse {
    success: boolean;
    message?: string;
    data?: {
        count: number;
    };
}

export const fetchMyActiveMatchesCount = cache(async (userId: string): Promise<ActiveMatchesCountResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: { count: number } }>({
        endpoint: '/api/data/user/fetch_my_active_matches_count',
        method: 'GET',
        queryParams: { userId },
        cache: 'force-cache',
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('ACTIVE_MATCHES_COUNT_FAILED_TO_FETCH')
        }
    });

    if (!response.success) {
        return { success: false, message: response.message };
    }

    return {
        success: true,
        data: { count: response.data?.data?.count as number }
    };
});

