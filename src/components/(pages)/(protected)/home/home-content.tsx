"use client"

// LIBRARIES
import { useQuery } from '@tanstack/react-query';

// COMPONENTS
import { LoadingSkeleton } from './loading-skeleton';
import { MatchCard } from './match-card';

// ACTIONS
import { client_fetchMatches } from '@/actions/functions/data/client/match/client_fetchMatches';

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
    const { data: matches = [], isLoading, isError } = useQuery({
        queryKey: ['matches'],
        queryFn: () => client_fetchMatches(authToken),
        staleTime: STALE_TIME,
        gcTime: CACHE_TIME,
        retry: 2,
        refetchOnWindowFocus: false,
    });
  
    return (
        <section className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">
                Welcome, {serverUserData.fullName}!
            </h1>
    
            {isLoading && <LoadingSkeleton />}
    
            {!isLoading && !isError && matches.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No matches found.</p>
                </div>
            )}
    
            {!isLoading && !isError && matches.length > 0 && (
                <div className="grid gap-4">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </section>
    );
};