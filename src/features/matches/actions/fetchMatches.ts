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

interface MatchesResponse {
    success: boolean;
    message?: string;
    data?: typesMatch[];
}

interface FetchMatchesParams {
    gender?: string;
    isAdmin?: boolean;
    playerLevel?: string;
    date?: string;
    status?: 'active' | 'pending' | 'finished';
    isPastMatches?: boolean;
    currentDate?: string;
    currentTime?: string;
}

export const fetchMatches = cache(async ({
    gender,
    isAdmin,
    playerLevel,
    date,
    status,
    isPastMatches,
    currentDate,
    currentTime
}: FetchMatchesParams): Promise<MatchesResponse> => {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { isAuth, userId } = await verifyAuth(authToken);

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
    if (status) url.searchParams.append('status', status);
    if (isPastMatches) url.searchParams.append('isPastMatches', 'true');
    if (currentDate) url.searchParams.append('currentDate', currentDate);
    if (currentTime) url.searchParams.append('currentTime', currentTime);
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

    return { 
        success: true, 
        data: result.data as typesMatch[]
    };
});