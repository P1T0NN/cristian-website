// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesUser } from "../types/typesPlayer";

interface PlayerResponse {
    success: boolean;
    message?: string;
    data?: typesUser;
}

export const fetchPlayer = cache(async (playerId: string): Promise<PlayerResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!playerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: typesUser }>({
        endpoint: '/api/data/user/fetch_user',
        method: 'GET',
        queryParams: { playerId },
        cache: 'force-cache',
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('USER_FAILED_TO_FETCH'),
            notFound: t('USER_NOT_FOUND')
        }
    });

    if (!response.success) {
        return { 
            success: false, 
            message: response.message 
        };
    }

    if (!response.data?.data) {
        return { 
            success: false, 
            message: t('USER_NOT_FOUND') 
        };
    }

    return { 
        success: true, 
        data: response.data.data 
    };
});

