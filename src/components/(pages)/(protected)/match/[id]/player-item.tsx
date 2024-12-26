// COMPONENTS
import { PlayerInfo } from "./player-info";
import { TemporaryPlayerInfo } from "./temporary-player-info";
import { TemporaryPlayerActions } from "./temporary-player-actions";
import { UserActions } from "./user-actions";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerItemProps = {
    player: typesUser;
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    isUserInMatch: boolean;
    areDefaultTeams?: boolean;
}

export const PlayerItem = async ({ 
    player, 
    matchIdFromParams,
    teamNumber,
    isUserInMatch,
    areDefaultTeams
}: PlayerItemProps) => {
    const currentUserData = await getUser() as typesUser;

    const isCurrentUser = player.id === currentUserData.id;

    return (
        <div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out"
        >
            {player.temporaryPlayer ? (
                <TemporaryPlayerInfo 
                    player={player}
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                    isDefaultTeam={areDefaultTeams as boolean}
                />
            ) : (
                <PlayerInfo 
                    player={player}
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                    areDefaultTeams={areDefaultTeams as boolean}
                />
            )}

            {player.temporaryPlayer ? (
                // Client component, we have to pass more props since we cant fetch them in client components
                <TemporaryPlayerActions
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                    player={player}
                    currentUserId={currentUserData.id}
                    isUserInMatch={isUserInMatch}
                    isAdmin={currentUserData.isAdmin}
                />
            ) : (
                // Client component, we have to pass more props since we cant fetch them in client components
                <UserActions
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                    player={player}
                    isCurrentUser={isCurrentUser}
                    isUserInMatch={isUserInMatch}
                    isAdmin={currentUserData.isAdmin}
                /> 
            )}
        </div>
    )
}