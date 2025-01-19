// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { MatchCard } from "./match-card";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatches } from "../../actions/fetchMatches";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

export const OldMatches = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("HomePage"),
        getUser() as Promise<typesUser>
    ]);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5); // Format: HH:mm

    const matchesResponse = await fetchMatches({
        userId: currentUserData.id,
        isAdmin: currentUserData.isAdmin,
        playerLevel: currentUserData.player_level,
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
