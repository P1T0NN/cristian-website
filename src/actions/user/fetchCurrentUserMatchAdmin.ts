// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "../auth/verifyAuth";

interface MatchAdminResponse {
    success: boolean;
    message?: string;
    data?: {
        isAdmin: boolean;
    };
}

export const fetchCurrentUserMatchAdmin = cache(async (matchId: string): Promise<MatchAdminResponse> => {
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

    if (!matchId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/match/fetch_current_user_match_admin?matchId=${matchId}`, {
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
        return { success: false, message: t('MATCH_ADMIN_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: { isAdmin: result.data.isAdmin }
    };
});