// COMPONENTS
import { TeamOneCard } from "./team-one-card";
import { TeamTwoCard } from "./team-two-card";
import { PlayerList } from "./player-list";

// ACTIONS
import { fetchMatch } from "@/actions/match/fetchMatch";
import { getUser } from "@/actions/auth/verifyAuth";

// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { typesUser } from "@/types/typesUser";

interface TeamDetailsProps {
    matchIdFromParams: string;
}

export const TeamDetails = async ({
    matchIdFromParams
}: TeamDetailsProps) => {
    const currentUserData = await getUser() as typesUser;

    const serverMatchData = await fetchMatch(matchIdFromParams);
    const match = serverMatchData.data?.match as typesMatch;

    const allPlayers = [
        ...(serverMatchData.data?.team1Players || []),
        ...(serverMatchData.data?.team2Players || []),
        ...(serverMatchData.data?.unassignedPlayers || [])
    ];

    const isUserInMatch = allPlayers.some(player => player.id === currentUserData.id);

    return (
        <>
            {match.has_teams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeamOneCard
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={1}
                    />
                    
                    <TeamTwoCard
                        matchIdFromParams={matchIdFromParams}
                        teamNumber={2}
                    />
                </div>
            ) : (
                <PlayerList
                    players={allPlayers}
                    matchIdFromParams={matchIdFromParams}
                    isUserInMatch={isUserInMatch}
                    match={match}
                />
            )}
        </>
    )
}