// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from "../auth/verifyAuth";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

interface DefaultLocationsResponse {
    success: boolean;
    message?: string;
    data?: typesLocation[];
}

export const fetchDefaultLocations = cache(async (): Promise<DefaultLocationsResponse> => {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { isAuth } = await verifyAuth(authToken);

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/fetch_default_locations`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        cache: "force-cache",
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS]
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('DEFAULT_LOCATIONS_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: result.data as typesLocation[]
    };
});

