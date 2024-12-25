// COMPONENTS
import { PlayerInfo } from "./player-info";
import { TemporaryPlayerInfo } from "./temporary-player-info";
import { TemporaryPlayerActions } from "./temporary-player-actions";
import { UserActions } from "./user-actions";

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerItemProps = {
    player: typesUser;
    isCurrentUser: boolean;
    teamNumber: 0 | 1 | 2;
    matchId: string;
    isAdmin: boolean;
    authToken: string;
    currentUserMatchAdmin: boolean;
    isUserInMatch: boolean;
    currentUserId: string;
    areDefaultTeams?: boolean;
}

export const PlayerItem = async ({ 
    player, 
    isCurrentUser,
    teamNumber,
    matchId,
    isAdmin,
    authToken,
    currentUserMatchAdmin,
    isUserInMatch,
    currentUserId,
    areDefaultTeams
}: PlayerItemProps) => {
    return (
        <div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out"
        >
            {player.temporaryPlayer ? (
                <TemporaryPlayerInfo 
                    authToken={authToken}
                    matchId={matchId}
                    player={player}
                    isAdmin={isAdmin}
                    currentUserMatchAdmin={currentUserMatchAdmin}
                    teamNumber={teamNumber}
                    isDefaultTeam={areDefaultTeams as boolean}
                />
            ) : (
                <PlayerInfo 
                    authToken={authToken}
                    matchId={matchId}
                    player={player}
                    isAdmin={isAdmin}
                    currentUserMatchAdmin={currentUserMatchAdmin}
                    teamNumber={teamNumber}
                    areDefaultTeams={areDefaultTeams as boolean}
                />
            )}

            {player.temporaryPlayer ? (
                <TemporaryPlayerActions
                    authToken={authToken}
                    matchId={matchId}
                    teamNumber={teamNumber}
                    player={player}
                    currentUserId={currentUserId}
                    isUserInMatch={isUserInMatch}
                    isAdmin={isAdmin}
                />
            ) : (
                <UserActions
                    authToken={authToken}
                    matchId={matchId}
                    teamNumber={teamNumber}
                    player={player}
                    isCurrentUser={isCurrentUser}
                    isUserInMatch={isUserInMatch}
                    isAdmin={isAdmin}
                /> 
            )}
        </div>
    )
}