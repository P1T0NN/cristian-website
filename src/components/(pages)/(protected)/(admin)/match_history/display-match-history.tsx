// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { PaginatedMatchHistory } from './paginated-match-history';

// ACTIONS
import { fetchAdminMatchHistory } from "@/actions/match/fetchAdminMatchHistory";

// TYPES
import { typesMatchHistory } from '@/types/typesMatchHistory';

export const DisplayMatchHistory = async () => {
    const t = await getTranslations("MatchHistoryPage");

    const serverMatchHistoryData = await fetchAdminMatchHistory();
    const matchHistoryData = serverMatchHistoryData.data as typesMatchHistory[];

    return (
        <div className="space-y-4">
            {matchHistoryData.length > 0 ? (
                <PaginatedMatchHistory matchHistory={matchHistoryData} />
            ) : (
                <div className="text-center py-4 bg-background rounded-lg shadow">
                    {t('noMatchHistoryFound')}
                </div>
            )}
        </div>
    )
}