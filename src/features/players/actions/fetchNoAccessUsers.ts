// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesUser } from "../types/typesPlayer";

interface NoAccessUsersResponse {
    success: boolean;
    message?: string;
    data?: typesUser[];
}

export const fetchNoAccessUsers = cache(async (): Promise<NoAccessUsersResponse> => {
    const t = await getTranslations("GenericMessages");

    const response = await apiRequest<{ data: typesUser[] }>({
        endpoint: '/api/data/user/fetch_no_access_users',
        method: 'GET',
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('NO_ACCESS_USERS_FAILED_TO_FETCH')
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

