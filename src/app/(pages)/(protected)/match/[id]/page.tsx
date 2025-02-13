// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { MatchHeader } from '@/features/matches/components/match-details/match-header';
import { MatchTeams } from '@/features/matches/components/match-details/match-teams';
import { MatchInfo } from '@/features/matches/components/match-details/match-info';
import { MatchFAQ } from '@/features/matches/components/match-details/match-faq';
import { MatchHeaderLoading } from '@/features/matches/components/match-details/loading/match-header-loading';
import { MatchTeamsLoading } from '@/features/matches/components/match-details/loading/match-teams-loading';
import { MatchInfoLoading } from '@/features/matches/components/match-details/loading/match-info-loading';

export default async function MatchPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <div className="min-h-screen">
            <Suspense fallback={<MatchHeaderLoading />}>
                <MatchHeader matchIdFromParams={id} />
            </Suspense>

            <main className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-y-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Sidebar */}
                        <div className="lg:w-1/4">
                            <Suspense fallback={<MatchInfoLoading />}>
                                <MatchInfo matchIdFromParams={id} />
                            </Suspense>
                        </div>

                        {/* Main Content */}
                        <div className="lg:w-3/4">
                            <Suspense fallback={<MatchTeamsLoading />}>
                                <MatchTeams matchIdFromParams={id} />
                            </Suspense>
                        </div>
                    </div>

                    <MatchFAQ />
                </div>
            </main>
        </div>
    );
}