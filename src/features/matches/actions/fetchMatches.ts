// REACTJS IMPORTS
import { cache } from "react";

// NEXTJS IMPORTS
import { getTranslations } from "next-intl/server";

// UTILS
import { apiRequest } from "@/shared/utils/apiUtils";

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
    status?: "active" | "pending" | "finished";
    isPastMatches?: boolean;
    currentDate?: string;
    currentTime?: string;
    currentUserId?: string;
    filterByUserId?: boolean;
}

export const fetchMatches = cache(async (params: FetchMatchesParams): Promise<MatchesResponse> => {
    const t = await getTranslations("GenericMessages")

    const queryParams: Record<string, string> = {}
    if (params.date) queryParams.date = params.date
    if (params.gender !== undefined) queryParams.gender = params.gender
    if (params.isAdmin !== undefined) queryParams.isAdmin = params.isAdmin.toString()
    if (params.playerLevel) queryParams.playerLevel = params.playerLevel
    if (params.status) queryParams.status = params.status
    if (params.isPastMatches) queryParams.isPastMatches = "true"
    if (params.currentDate) queryParams.currentDate = params.currentDate
    if (params.currentTime) queryParams.currentTime = params.currentTime

    if (params.currentUserId) {
        queryParams.currentUserId = params.currentUserId;
        if (params.filterByUserId) {
            queryParams.filterByUserId = 'true';
        }
    }

    const response = await apiRequest<{ data: typesMatch[] }>({
        endpoint: "/api/data/match/fetch_matches",
        method: "GET",
        queryParams,
        errorMessages: {
            unauthorized: t("UNAUTHORIZED"),
            requestFailed: t("MATCHES_FAILED_TO_FETCH"),
        }
    })

    if (!response.success) {
        return { success: false, message: response.message }
    }

    return {
        success: true,
        data: response.data?.data,
    }
})

