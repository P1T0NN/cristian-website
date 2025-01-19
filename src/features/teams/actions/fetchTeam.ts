// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesTeam } from "../types/typesTeam";

interface TeamResponse {
    success: boolean;
    message?: string;
    data?: typesTeam;
}

export const fetchTeam = cache(async (teamId: string): Promise<TeamResponse> => {
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

    if (!teamId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/data/team/fetch_team?teamId=${encodeURIComponent(teamId)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
        },
        cache: "force-cache",
        next: {
            tags: [TAGS_FOR_CACHE_REVALIDATIONS.TEAMS]
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        return { success: false, message: t('TEAM_FAILED_TO_FETCH') };
    }

    const result = await response.json();

    return { 
        success: true, 
        data: result.data as typesTeam
    };
});