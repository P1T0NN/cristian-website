// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesTeam } from "../types/typesTeam";

interface TeamResponse {
    success: boolean;
    message?: string;
    data?: typesTeam;
}

export const fetchTeam = cache(async (teamId: string): Promise<TeamResponse> => {
    const t = await getTranslations("GenericMessages");

    if (!teamId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await apiRequest<{ data: typesTeam }>({
        endpoint: '/api/data/team/fetch_team',
        method: 'GET',
        queryParams: { teamId },
        cache: 'force-cache',
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.TEAMS]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('TEAM_FAILED_TO_FETCH')
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