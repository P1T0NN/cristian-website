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

interface TeamsResponse {
    success: boolean;
    message?: string;
    data?: typesTeam[];
}

export const fetchTeams = cache(async (): Promise<TeamsResponse> => {
    const t = await getTranslations("GenericMessages");

    const response = await apiRequest<{ data: typesTeam[] }>({
        endpoint: '/api/data/team/fetch_teams',
        method: 'GET',
        cache: 'force-cache',
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.TEAMS]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('TEAMS_FAILED_TO_FETCH')
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