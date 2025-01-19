// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesMatch } from "../types/typesMatch";

interface MyActiveMatchesResponse {
    success: boolean;
    message?: string;
    data?: typesMatch[];
}

export const fetchMyActiveMatches = cache(async (userId: string): Promise<MyActiveMatchesResponse> => {
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

    if (!userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/fetch_my_active_matches`);
    url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        // No need to cache this
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('ACTIVE_MATCHES_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: result.data as typesMatch[] 
    };
});

