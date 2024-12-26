// REACTJS IMPORTS
import { Suspense } from 'react';

// COMPONENTS
import { MatchDetails } from '@/components/(pages)/(protected)/match/[id]/match-details';
import { MatchInstructions } from '@/components/(pages)/(protected)/match/[id]/match-instructions';
import { DisplayTeamDetails } from '@/components/(pages)/(protected)/match/[id]/display-team-details';
import { SwitchTeamColors } from '@/components/(pages)/(protected)/match/[id]/switch-team-colors';
import { TeamDetails } from '@/components/(pages)/(protected)/match/[id]/team-details';
import { AdminFunctions } from '@/components/(pages)/(protected)/match/[id]/admin-functions';
import { MatchFAQ } from '@/components/(pages)/(protected)/match/[id]/match-faq';
import { FAQWarning } from '@/components/(pages)/(protected)/match/[id]/faq-warning';
import { MatchDetailsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/match-details-loading';
import { MatchInstructionsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/match-instructions-loading';
import { DisplayTeamDetailsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/display-team-details-loading';
import { SwitchTeamColorsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/switch-team-colors-loading';
import { TeamDetailsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/team-details-loading';
import { AdminFunctionsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/admin-functions-loading';

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