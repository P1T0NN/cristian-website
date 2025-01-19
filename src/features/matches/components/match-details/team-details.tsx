// COMPONENTS
import { TeamCard } from "./team-card";
import { PlayerList } from "./player-list";

// ACTIONS
import { fetchMatch } from "../../actions/fetchMatch";

// TYPES
import type { typesMatch } from "../../types/typesMatch";

interface TeamDetailsProps {
    matchIdFromParams: string;
}

export const TeamDetails = async ({
    matchIdFromParams
}: TeamDetailsProps) => {
    const serverMatchData = await fetchMatch(matchIdFromParams);
    
    const match = serverMatchData.data?.match as typesMatch;

    return (
        <>
            {match.has_teams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TeamCard 
                        matchIdFromParams={matchIdFromParams} 
                        teamNumber={1} 
                    />
                    
                    <TeamCard 
                        matchIdFromParams={matchIdFromParams} 
                        teamNumber={2} 
                    />
                </div>
            ) : (
                <PlayerList
                    players={serverMatchData.data?.players || []}
                    matchIdFromParams={matchIdFromParams}
                    match={match}
                />
            )}
        </>
    );
};