"use client"

// REACTJS IMPORTS
import { useState } from 'react';

// LIBRARIES
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

// COMPONENTS
import { Card, CardContent } from "@/components/ui/card";
import { HomeLoading } from './home-loading';
import { FilterModal, type FilterValues } from './filter-modal';
import { MatchesRow } from './matches-row';
import { Button } from "@/components/ui/button";

// ACTIONS
import { client_fetchMatches } from '@/actions/functions/data/client/match/client_fetchMatches';

// UTILS
import { groupMatches } from './utils/groupMatches';
import { sortMatchesByDate } from './utils/sortMatches';
import { filterMatches } from './utils/filterMatches';

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Calendar, Filter, RefreshCw } from 'lucide-react'

const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 10 * 60 * 1000;

type HomeContentProps = {
    authToken: string;
    serverUserData: typesUser;
    locale: string;
}

export const HomeContent = ({ 
    authToken,
    serverUserData,
    locale
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

    const { data: matches = [], isLoading, isError, refetch } = useQuery({
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
            <Card className="mb-8 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                            {t('welcome', { name: serverUserData.fullName })}
                        </h1>
                        <div className="flex space-x-2">
                            <FilterModal 
                                onFilterChange={handleFilterChange} 
                                onClearFilters={handleClearFilters}
                            >
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </FilterModal>
                            <Button variant="outline" size="icon" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg mb-4">
                        <h2 className="font-semibold mb-2 flex items-center">
                            <Calendar className="mr-2 h-5 w-5" />
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
                </CardContent>
            </Card>
    
            {isLoading && <HomeLoading />}
    
            <AnimatePresence>
                {!isLoading && !isError && filteredMatches.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-8"
                    >
                        <p className="text-muted-foreground">
                            {t('noMatchesFound')}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
    
            {!isLoading && !isError && filteredMatches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="flex flex-col items-center space-y-8"
                >
                    <MatchesRow title={t('todayMatches')} matches={groupedMatches.today} serverUserData={serverUserData} locale={locale} />
                    <MatchesRow title={t('tomorrowMatches')} matches={groupedMatches.tomorrow} serverUserData={serverUserData} locale={locale} />
                    <MatchesRow title={t('upcomingMatches')} matches={sortedFutureMatches} serverUserData={serverUserData} locale={locale} />
                </motion.div>
            )}
        </section>
    );
};