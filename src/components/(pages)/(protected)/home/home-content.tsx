"use client"

// REACTJS IMPORTS
import { useState } from 'react';

// LIBRARIES
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

// COMPONENTS
import { LoadingSkeleton } from './loading-skeleton';
import { FilterModal, type FilterValues } from './filter-modal';
import { MatchesRow } from './matches-row';

// ACTIONS
import { client_fetchMatches } from '@/actions/functions/data/client/match/client_fetchMatches';

// UTILS
import { groupMatches } from './utils/groupMatches';
import { sortMatchesByDate } from './utils/sortMatches';
import { filterMatches } from './utils/filterMatches';

// TYPES
import type { typesUser } from "@/types/typesUser";

type HomeContentProps = {
    authToken: string;
    serverUserData: typesUser;
}

const STALE_TIME = 5 * 60 * 1000;  // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

export const HomeContent = ({ 
    authToken,
    serverUserData 
}: HomeContentProps) => {
    const t = useTranslations("HomePage");

    const [activeFilters, setActiveFilters] = useState<FilterValues>({
        location: '',
        price: '',
        date: '',
        timeFrom: '',
        timeTo: '',
        gender: '',
        matchType: '',
    });

    const { data: matches = [], isLoading, isError } = useQuery({
        queryKey: ['matches'],
        queryFn: () => client_fetchMatches(authToken),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const filteredMatches = filterMatches(matches, activeFilters);
    const groupedMatches = groupMatches(filteredMatches);
    const sortedFutureMatches = sortMatchesByDate(groupedMatches.future);

    const handleFilterChange = (newFilters: FilterValues) => {
        setActiveFilters(newFilters);
    };

    const handleClearFilters = () => {
        setActiveFilters({
            location: '',
            price: '',
            date: '',
            timeFrom: '',
            timeTo: '',
            gender: '',
            matchType: '',
        });
    };

    return (
        <section className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {t('welcome', { name: serverUserData.fullName })}
                    </h1>
                    <FilterModal onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
                </div>

                <div className="bg-muted p-4 rounded-lg mb-4">
                    <h2 className="font-semibold mb-2">
                        {Object.values(activeFilters).some(filter => filter !== '') 
                            ? t('filteredMatches')
                            : t('allMatches')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {Object.values(activeFilters).some(filter => filter !== '') 
                            ? t('filteredMessage')
                            : t('allAvailableMessage')}
                    </p>
                </div>
            </div>
    
            {isLoading && <LoadingSkeleton />}
    
            {!isLoading && !isError && filteredMatches.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        {t('noMatchesFound')}
                    </p>
                </div>
            )}
    
            {!isLoading && !isError && filteredMatches.length > 0 && (
                <div className="flex flex-col items-center space-y-8">
                    <MatchesRow title={t('todayMatches')} matches={groupedMatches.today} serverUserData={serverUserData} />
                    <MatchesRow title={t('tomorrowMatches')} matches={groupedMatches.tomorrow} serverUserData={serverUserData} />
                    <MatchesRow title={t('upcomingMatches')} matches={sortedFutureMatches} serverUserData={serverUserData} />
                </div>
            )}
        </section>
    );
};