// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "../auth/verifyAuth";

// TYPES
import type { typesLocation } from "@/types/typesLocation";

interface SearchLocationsResponse {
    success: boolean;
    message?: string;
    data?: typesLocation[];
}

export const serverSearchLocations = cache(async (searchTerm: string): Promise<SearchLocationsResponse> => {
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/location/search_locations?search=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('LOCATIONS_SEARCH_FAILED') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: result.data as typesLocation[]
    };
});