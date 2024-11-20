// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// COMPONENTS
import { MatchDetails } from '@/components/(pages)/(protected)/match/[id]/match-details';
import { MatchInstructions } from '@/components/(pages)/(protected)/match/[id]/match-instructions';
import { DisplayTeamDetails } from '@/components/(pages)/(protected)/match/[id]/display-team-details';
import { SwitchTeamColors } from '@/components/(pages)/(protected)/match/[id]/switch-team-colors';
import { TeamCard } from '@/components/(pages)/(protected)/match/[id]/team-card';
import { AdminFunctions } from '@/components/(pages)/(protected)/match/[id]/admin-functions';

// SERVER ACTIONS
import { getUser } from '@/actions/actions/auth/verifyAuth';

// ACTIONS
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

    const serverUserData = await getUser() as typesUser;
    const { match, team1Players, team2Players } = await serverFetchMatch(id);

    const isUserInTeam = (players: typesUser[] | undefined) => {
        return players?.some(player => player.id === serverUserData.id) ?? false
    }

    const userTeamNumber = isUserInTeam(team1Players) 
        ? 1 
        : isUserInTeam(team2Players) 
            ? 2 
            : null

    return (
        <section className="space-y-6 p-4 max-w-4xl mx-auto">
            <MatchDetails serverMatchData={match} />

            <MatchInstructions 
                instructions={match.match_instructions} 
                matchId={id} 
                authToken={authToken} 
            />

            <DisplayTeamDetails match={match} />

            <div className="flex items-center">
                {serverUserData.isAdmin && (
                    <SwitchTeamColors
                        matchId={id}
                        authToken={authToken}
                        isAdmin={serverUserData.isAdmin}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TeamCard
                    teamName={match.team1_name}
                    players={team1Players}
                    teamNumber={1}
                    currentUserId={serverUserData.id}
                    userTeamNumber={userTeamNumber}
                    matchId={id}
                    matchType={match.match_type}
                    isAdmin={serverUserData.isAdmin}
                    authToken={authToken}
                />
                
                <TeamCard
                    teamName={match.team2_name}
                    players={team2Players}
                    teamNumber={2}
                    currentUserId={serverUserData.id}
                    userTeamNumber={userTeamNumber}
                    matchId={id}
                    matchType={match.match_type}
                    isAdmin={serverUserData.isAdmin}
                    authToken={authToken}
                />
            </div>

            {serverUserData.isAdmin && (
                <AdminFunctions matchId={id} authToken={authToken} />
            )}
        </section>
    );
}