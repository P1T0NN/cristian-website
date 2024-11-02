// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { HomeDetails } from '@/components/(pages)/(protected)/home/home-details';
import { DisplayMatches } from '@/components/(pages)/(protected)/home/display-matches';
import { HomeDetailsLoading } from '@/components/(pages)/(protected)/home/loading/home-details-loading';
import { MatchesLoading } from '@/components/(pages)/(protected)/home/loading/matches-loading';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';
import type { FilterValues } from '@/components/(pages)/(protected)/home/filter-modal';

export default async function HomePage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const serverUserData = await server_fetchUserData();
    
    const userData = serverUserData.data as typesUser;

    const awaitedSearchParams = await searchParams;

    const activeFilters: FilterValues = {
        location: awaitedSearchParams.location as string || '',
        price: awaitedSearchParams.price as string || '',
        date: awaitedSearchParams.date as string || '',
        timeFrom: awaitedSearchParams.timeFrom as string || '',
        timeTo: awaitedSearchParams.timeTo as string || '',
        gender: awaitedSearchParams.gender as string || '',
        matchType: awaitedSearchParams.matchType as string || '',
    };

    return (
        <section className="p-6 max-w-6xl mx-auto">
            <Suspense fallback={<HomeDetailsLoading />}>
                <HomeDetails serverUserData={userData} activeFilters={activeFilters} />
            </Suspense>

            <Suspense fallback={<MatchesLoading />}>
                <DisplayMatches serverUserData={userData} activeFilters={activeFilters} />
            </Suspense>
        </section>
    );
}