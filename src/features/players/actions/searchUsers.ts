// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesUser } from "../types/typesPlayer";

interface SearchUsersResponse {
    success: boolean;
    message?: string;
    data?: typesUser[];
}

export const searchUsers = cache(async (searchTerm: string): Promise<SearchUsersResponse> => {
    const t = await getTranslations("GenericMessages");

    const response = await apiRequest<{ data: typesUser[] }>({
        endpoint: '/api/data/debt/search_users',
        method: 'GET',
        queryParams: { search: searchTerm },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('USERS_SEARCH_FAILED')
        }
    });

    if (!response.success) {
        return { 
            success: false, 
            message: response.message 
        };
    }

    return { 
        success: true, 
        data: response.data?.data 
    };
});