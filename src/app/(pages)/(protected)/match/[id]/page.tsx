// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { MatchDetails } from '@/features/matches/components/match-details/match-details';
import { MatchInstructions } from '@/features/matches/components/match-details/match-instructions';
import { DisplayTeamDetails } from '@/features/matches/components/match-details/display-team-details';
import { SwitchTeamColors } from '@/features/matches/components/match-details/switch-team-colors';
import { TeamDetails } from '@/features/matches/components/match-details/team-details';
import { AdminFunctions } from '@/features/matches/components/match-details/admin-functions';
import { MatchFAQ } from '@/features/matches/components/match-details/match-faq';
import { FAQWarning } from '@/features/matches/components/match-details/faq-warning';
import { MatchDetailsLoading } from '@/features/matches/components/loading/match-details-loading';
import { MatchInstructionsLoading } from '@/features/matches/components/loading/match-instructions-loading';
import { DisplayTeamDetailsLoading } from '@/features/matches/components/loading/display-team-details-loading';
import { SwitchTeamColorsLoading } from '@/features/matches/components/loading/switch-team-colors-loading';
import { TeamDetailsLoading } from '@/features/matches/components/loading/team-details-loading';
import { AdminFunctionsLoading } from '@/features/matches/components/loading/admin-functions-loading';

export default async function MatchPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

   return (
        <section className="space-y-6 p-4 max-w-4xl mx-auto">
            <FAQWarning />
            
            <Suspense fallback={<MatchDetailsLoading />}>
                <MatchDetails matchIdFromParams={id} />
            </Suspense>

            <Suspense fallback={<MatchInstructionsLoading />}>
                <MatchInstructions matchIdFromParams={id} />
            </Suspense>

            <Suspense fallback={<DisplayTeamDetailsLoading />}>
                <DisplayTeamDetails matchIdFromParams={id} />
            </Suspense>

            <Suspense fallback={<SwitchTeamColorsLoading />}>
                <SwitchTeamColors
                    matchIdFromParams={id}
                />
            </Suspense>

            <Suspense fallback={<TeamDetailsLoading />}>
                <TeamDetails
                    matchIdFromParams={id}
                />
            </Suspense>

            <Suspense fallback={<AdminFunctionsLoading />}>
                <AdminFunctions 
                    matchIdFromParams={id}
                />
            </Suspense>

            <div id="match-faq">
                <MatchFAQ />
            </div>
        </section>
    );
}