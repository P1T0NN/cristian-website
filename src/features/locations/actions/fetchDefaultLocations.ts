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

interface DefaultLocationsResponse {
    success: boolean;
    message?: string;
    data?: typesLocation[];
}

export const fetchDefaultLocations = cache(async (): Promise<DefaultLocationsResponse> => {
    const t = await getTranslations("GenericMessages");

    const response = await apiRequest<{ data: typesLocation[] }>({
        endpoint: '/api/data/location/fetch_default_locations',
        method: 'GET',
        cache: 'force-cache',
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS]
        },
        errorMessages: {
            unauthorized: t('UNAUTHORIZED'),
            requestFailed: t('DEFAULT_LOCATIONS_FAILED_TO_FETCH')
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