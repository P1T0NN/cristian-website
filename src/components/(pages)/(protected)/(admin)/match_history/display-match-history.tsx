// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { PaginatedMatchHistory } from './paginated-match-history';

// ACTIONS
import { serverFetchAdminMatchHistory } from '@/actions/functions/data/server/server_fetchAdminMatchHistory';

// TYPES
import { typesMatchHistory } from '@/types/typesMatchHistory';

export const DisplayMatchHistory = async () => {
    const t = await getTranslations("MatchHistoryPage");
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverMatchHistoryData = await serverFetchAdminMatchHistory();
    const matchHistoryData = serverMatchHistoryData.data as typesMatchHistory[];

    return (
        <div className="space-y-4">
            {matchHistoryData.length > 0 ? (
                <PaginatedMatchHistory authToken={authToken} matchHistory={matchHistoryData} />
            ) : (
                <div className="text-center py-4 bg-background rounded-lg shadow">
                    {t('noMatchHistoryFound')}
                </div>
            )}
        </div>
    )
}