// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { PaginatedMatchHistory } from './paginated-match-history';

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchMatches } from "../../actions/fetchMatches";

// TYPES
import type { typesMatch } from "../../types/typesMatch";
import type { typesBaseMatchPlayer } from "@/features/players/types/typesPlayer";
import type { typesUser } from "@/features/players/types/typesPlayer";

export const DisplayMatchHistory = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations("MatchHistoryPage"),
        getUser() as Promise<typesUser>
    ]);

    const serverMatchesData = await fetchMatches({
        userId: currentUserData.id,
        isAdmin: currentUserData.isAdmin,
        status: 'finished',
    });
    
    const finishedMatches = serverMatchesData.data as (typesMatch & {
        match_players: typesBaseMatchPlayer[];
    })[];

    return (
        <div className="space-y-4">
            {finishedMatches.length > 0 ? (
                <PaginatedMatchHistory matches={finishedMatches} />
            ) : (
                <div className="text-center py-4 bg-background rounded-lg shadow">
                    {t('noMatchHistoryFound')}
                </div>
            )}
        </div>
    );
};