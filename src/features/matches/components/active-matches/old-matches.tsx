// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { MatchCard } from "./match-card";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatches } from "../../actions/fetchMatches";

// UTILS
import { getCurrentDateTimeStrings } from "@/shared/utils/dateUtils";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

export const OldMatches = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("HomePage"),
        getUser() as Promise<typesUser>
    ]);

    const { currentDate, currentTime } = getCurrentDateTimeStrings();

    const matchesResponse = await fetchMatches({
        isAdmin: currentUserData.isAdmin,
        playerLevel: currentUserData.playerLevel,
        isPastMatches: true,
        currentDate,
        currentTime
    });

    if (!matchesResponse.success || !matchesResponse.data || matchesResponse.data.length === 0) {
        return (
            <div className="flex items-center justify-center p-6 text-muted-foreground">
                <p>{t('noPastEventsAvailable')}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchesResponse.data.map((match) => (
                <MatchCard
                    key={match.id}
                    match={match}
                />
            ))}
        </div>
    );
};
