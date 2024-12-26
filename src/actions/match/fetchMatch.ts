// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "../auth/verifyAuth";

// TYPES
import type { typesMatchWithPlayers } from "@/types/typesMatchWithPlayers";

interface MatchResponse {
    success: boolean;
    message?: string;
    data?: typesMatchWithPlayers;
}

export const fetchMatch = cache(async (matchId: string): Promise<MatchResponse> => {
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

    if(!matchId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_match?matchId=${matchId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('MATCH_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: result.data as typesMatchWithPlayers 
    };
});