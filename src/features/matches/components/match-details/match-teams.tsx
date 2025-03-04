// COMPONENTS
import { MatchTeamCard } from "./match-team-card";

// ACTIONS
import { fetchMatch } from "../../actions/fetchMatch";
import { getUser } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesPlayer } from "@/features/matches/types/typesMatch";

interface MatchTeamsProps {
    matchIdFromParams: string;
}

export const MatchTeams = async ({ 
    matchIdFromParams 
}: MatchTeamsProps) => {
    const currentUserData = await getUser() as typesUser;

    // NOTE: I have to pass userId like this because in route.ts when I call verifyAuth it doesn't work for some reason
    const { data: match } = await fetchMatch(matchIdFromParams, currentUserData.id);

    // Check if current user is a match admin in any team
    const isMatchAdmin = Boolean(
        match?.team1Players.some(player => 
            player.userId === currentUserData.id && player.hasMatchAdmin
        ) || match?.team2Players.some(player => 
            player.userId === currentUserData.id && player.hasMatchAdmin
        )
    );

    // Check if any player in either team has requested a substitute
    const hasSubstituteRequests = Boolean(
        match?.team1Players.some(player => player.substituteRequested) ||
        match?.team2Players.some(player => player.substituteRequested)
    );

    return (
        <div className="space-y-6">
            <MatchTeamCard
                matchIdFromParams={matchIdFromParams}
                teamName={match?.team1Name as string}
                teamColor="red"
                teamNumber={1}
                players={match?.team1Players as typesPlayer[]}
                isMatchAdmin={isMatchAdmin}
                hasSubstituteRequests={hasSubstituteRequests}
            />

            <MatchTeamCard
                matchIdFromParams={matchIdFromParams}
                teamName={match?.team2Name as string}
                teamColor="blue"
                teamNumber={2}
                players={match?.team2Players as typesPlayer[]}
                isMatchAdmin={isMatchAdmin}
                hasSubstituteRequests={hasSubstituteRequests}
            />
        </div>
    );
};