// REACTJS IMPORTS
import { cache } from "react";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

// TYPES
import type { typesLocation } from "../types/typesLocation";

interface SearchLocationsResponse {
    success: boolean;
    message?: string;
    data?: typesLocation[];
}

export const serverSearchLocations = cache(async (searchTerm: string): Promise<SearchLocationsResponse> => {
    const t = await getTranslations("GenericMessages");

    const response = await apiRequest<{ data: typesLocation[] }>({
        endpoint: '/api/data/location/search_locations',
        method: 'GET',
        queryParams: {
            search: searchTerm
        },
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('LOCATIONS_SEARCH_FAILED')
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