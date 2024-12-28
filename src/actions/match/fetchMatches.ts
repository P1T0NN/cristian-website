// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "../auth/verifyAuth";

// TYPES
import type { typesMatch } from "@/types/typesMatch";

interface MatchesResponse {
    success: boolean;
    message?: string;
    data?: typesMatch[];
}

interface FetchMatchesParams {
    gender?: string;
    isAdmin?: boolean;
    playerLevel?: string;
    userId: string;
    date?: string;
}

export const fetchMatches = cache(async ({
    gender,
    isAdmin,
    playerLevel,
    userId,
    date
}: FetchMatchesParams): Promise<MatchesResponse> => {
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

    const url = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_matches`);
    
    if (date) url.searchParams.append('date', date);
    if (gender !== undefined) url.searchParams.append('gender', gender);
    if (isAdmin !== undefined) url.searchParams.append('isAdmin', isAdmin.toString());
    if (playerLevel) url.searchParams.append('playerLevel', playerLevel);
    url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        // No need to cache this, it's dynamic
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('MATCHES_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    if (Array.isArray(result.data)) {
        result.data = result.data.map((match: typesMatch) => ({
            ...match,
            isUserInMatch: match.isUserInMatch || false
        }));
    }

    return { 
        success: true, 
        data: result.data as typesMatch[]
    };
});