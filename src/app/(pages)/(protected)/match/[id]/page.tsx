// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// COMPONENTS
import { MatchDetails } from '@/components/(pages)/(protected)/match/[id]/match-details';
import { MatchInstructions } from '@/components/(pages)/(protected)/match/[id]/match-instructions';
import { DisplayTeamDetails } from '@/components/(pages)/(protected)/match/[id]/display-team-details';
import { SwitchTeamColors } from '@/components/(pages)/(protected)/match/[id]/switch-team-colors';
import { TeamCard } from '@/components/(pages)/(protected)/match/[id]/team-card';
import { MatchDetailsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/match-details-loading';
import { MatchInstructionsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/match-instructions-loading';
import { DisplayTeamDetailsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/display-team-details-loading';
import { SwitchTeamColorsLoading } from '@/components/(pages)/(protected)/match/[id]/loading/switch-team-colors-loading';
import { TeamCardLoading } from '@/components/(pages)/(protected)/match/[id]/loading/team-card-loading';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';
import { serverFetchMatch } from '@/actions/functions/data/server/server_fetchMatch';

// TYPES
import type { typesUser } from "@/types/typesUser";


export default async function MatchPage({ 
    params
}: { 
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await server_fetchUserData();
    const { match, team1Players, team2Players } = await serverFetchMatch(id);

    const userData = serverUserData.data as typesUser;

    const isUserInTeam = (players: typesUser[] | undefined) => {
        return players?.some(player => player.id === userData.id) ?? false
    }

    const userTeamNumber = isUserInTeam(team1Players) 
        ? 1 
        : isUserInTeam(team2Players) 
            ? 2 
            : null

    return (
        <section className="space-y-6 p-4 max-w-4xl mx-auto">
            <Suspense fallback={<MatchDetailsLoading />}>
                <MatchDetails serverMatchData={match} />
            </Suspense>

            <Suspense fallback={<MatchInstructionsLoading />}>
                <MatchInstructions 
                    instructions={match.match_instructions} 
                    matchId={id} 
                    authToken={authToken} 
                />
            </Suspense>

            <Suspense fallback={<DisplayTeamDetailsLoading />}>
                <DisplayTeamDetails match={match} />
            </Suspense>

            <div className="flex items-center">
                <Suspense fallback={<SwitchTeamColorsLoading />}>
                    {userData.isAdmin && (
                        <SwitchTeamColors
                            matchId={id}
                            authToken={authToken}
                            isAdmin={userData.isAdmin}
                        />
                    )}
                </Suspense>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Suspense fallback={<TeamCardLoading />}>
                    <TeamCard
                        teamName={match.team1_name}
                        players={team1Players}
                        teamNumber={1}
                        currentUserId={userData.id}
                        userTeamNumber={userTeamNumber}
                        matchId={id}
                        authToken={authToken}
                    />
                </Suspense>
                <Suspense fallback={<TeamCardLoading />}>
                    <TeamCard
                        teamName={match.team2_name}
                        players={team2Players}
                        teamNumber={2}
                        currentUserId={userData.id}
                        userTeamNumber={userTeamNumber}
                        matchId={id}
                        authToken={authToken}
                    />
                </Suspense>
            </div>
        </section>
    );
}