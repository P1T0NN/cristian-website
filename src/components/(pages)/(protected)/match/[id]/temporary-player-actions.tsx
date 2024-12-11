"use client"

// REACTJS IMPORTS
import { useState } from "react";

// COMPONENTS
import { RemoveFriendButton } from "./remove-friend-button";
import { ReplaceTemporaryPlayerButton } from "./replace-temporary-player-button";
import { TemporaryPlayerSubstituteRequestDialog } from "./temporary-player-substitute-request-dialog";

// TYPES
import type { typesUser } from "@/types/typesUser";

type UserActionsProps = {
    authToken: string;
    matchId: string;
    teamNumber: 0 | 1 | 2;
    player: typesUser;
    isCurrentUser: boolean;
    isUserInMatch: boolean;
    isAdmin: boolean;
}

export const TemporaryPlayerActions = ({
    authToken,
    matchId,
    teamNumber,
    player,
    isCurrentUser,
    isUserInMatch,
    isAdmin
}: UserActionsProps) => {
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);

    return (
        <div className="flex items-center space-x-2 relative z-10 mt-2 sm:mt-0">
            {isCurrentUser && !isAdmin ? (
                <RemoveFriendButton
                    authToken={authToken}
                    player={player}
                    matchId={matchId}
                />
            ) : (player.temporaryPlayer?.substitute_requested && !isUserInMatch) && (
                <ReplaceTemporaryPlayerButton
                    authToken={authToken}
                    player={player}
                    matchId={matchId}
                    teamNumber={teamNumber}
                />
            )}

            {showSubstituteDialog && (
                <TemporaryPlayerSubstituteRequestDialog
                    authToken={authToken}
                    matchId={matchId}
                    temporaryPlayerId={player.temporaryPlayer?.id as string}
                    setShowSubstituteDialog={setShowSubstituteDialog}
                />
            )}
        </div>
    )
}