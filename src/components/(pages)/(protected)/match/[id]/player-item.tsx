// COMPONENTS
import { PlayerInfo } from "./player-info";
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
    currentUserId
}: PlayerItemProps) => {
    return (
        <div 
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out"
        >
            <PlayerInfo 
                authToken={authToken}
                matchId={matchId}
                player={player}
                isAdmin={isAdmin}
                currentUserMatchAdmin={currentUserMatchAdmin}
                teamNumber={teamNumber}
                currentUserId={currentUserId}
            />

            <UserActions
                authToken={authToken}
                matchId={matchId}
                teamNumber={teamNumber}
                player={player}
                isCurrentUser={isCurrentUser}
                isUserInMatch={isUserInMatch}
                isAdmin={isAdmin}
            />
        </div>
    )
}