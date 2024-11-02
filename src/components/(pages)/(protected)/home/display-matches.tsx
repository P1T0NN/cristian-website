/// LIBRARIES
import * as motion from "framer-motion/client";
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { MatchesRow } from './match-row';
import { AnimationNoMatches } from './animation-no-matches';

// ACTIONS
import { serverFetchMatches } from "@/actions/functions/data/server/server_fetchMatches";

// UTILS
import { filterMatches } from "./utils/filterMatches";
import { groupMatches } from "./utils/groupMatches";
import { sortMatchesByDate } from "./utils/sortMatches";

// TYPES
import type { typesUser } from '@/types/typesUser';
import type { typesMatch } from '@/types/typesMatch';
import type { FilterValues } from "./filter-modal";

type DisplayMatchesProps = {
    serverUserData: typesUser;
    activeFilters: FilterValues;
};

export const DisplayMatches = async ({
    serverUserData,
    activeFilters
}: DisplayMatchesProps) => {
    const t = await getTranslations("HomePage");

    const serverMatchesData = await serverFetchMatches();
    const matchesData = serverMatchesData.data as typesMatch[];

    const filteredMatches = filterMatches(matchesData, activeFilters);
    const groupedMatches = groupMatches(filteredMatches);
    const sortedFutureMatches = sortMatchesByDate(groupedMatches.future);

    return (
        <>
            <AnimationNoMatches serverMatchesData={matchesData} />
    
            {matchesData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="flex flex-col items-center space-y-8"
                >
                    <MatchesRow title={t('todayMatches')} matches={groupedMatches.today} serverUserData={serverUserData} />
                    <MatchesRow title={t('tomorrowMatches')} matches={groupedMatches.tomorrow} serverUserData={serverUserData} />
                    <MatchesRow title={t('upcomingMatches')} matches={sortedFutureMatches} serverUserData={serverUserData} />
                </motion.div>
            )}
        </>
    )
}