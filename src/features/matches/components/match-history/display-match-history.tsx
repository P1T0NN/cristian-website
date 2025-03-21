// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { PaginatedMatchHistory } from './paginated-match-history';

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatches } from "../../actions/fetchMatches";

// TYPES
import type { typesMatch, typesPlayer } from "../../types/typesMatch";
import type { typesUser } from "@/features/players/types/typesPlayer";

export const DisplayMatchHistory = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("MatchHistoryPage"),
        getUser() as Promise<typesUser>
    ]);

    // Fetch both finished and cancelled matches
    const [finishedMatchesResponse, cancelledMatchesResponse] = await Promise.all([
        fetchMatches({
            isAdmin: currentUserData.isAdmin,
            status: 'finished',
        }),
        fetchMatches({
            isAdmin: currentUserData.isAdmin,
            status: 'cancelled',
        })
    ]);
    
    const finishedMatches = finishedMatchesResponse.data as (typesMatch & {
        matchPlayers: typesPlayer[];
    })[];

    const cancelledMatches = cancelledMatchesResponse.data as (typesMatch & {
        matchPlayers: typesPlayer[];
    })[];

    // Combine and sort matches by date (most recent first)
    const allHistoryMatches = [...finishedMatches, ...cancelledMatches].sort((a, b) => {
        const dateA = new Date(`${a.startsAtDay}T${a.startsAtHour}`);
        const dateB = new Date(`${b.startsAtDay}T${b.startsAtHour}`);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    return (
        <div className="space-y-4">
            {allHistoryMatches.length > 0 ? (
                <PaginatedMatchHistory matches={allHistoryMatches} />
            ) : (
                <div className="text-center py-4 bg-background rounded-lg shadow">
                    {t('noMatchHistoryFound')}
                </div>
            )}
        </div>
    );
};