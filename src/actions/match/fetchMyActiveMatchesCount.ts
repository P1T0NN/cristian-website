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

interface ActiveMatchesCountResponse {
    success: boolean;
    message?: string;
    data?: {
        count: number;
    };
}

export const fetchMyActiveMatchesCount = cache(async (userId: string): Promise<ActiveMatchesCountResponse> => {
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

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/user/fetch_my_active_matches_count`);
    url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        cache: "force-cache",
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT]
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('ACTIVE_MATCHES_COUNT_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: { count: result.data.count }
    };
});

