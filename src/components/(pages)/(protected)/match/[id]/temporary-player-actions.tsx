"use client"

// REACTJS IMPORTS
import { useState } from "react";

// COMPONENTS
import { CancelTemporaryPlayerSubstitutionButton } from "./cancel-temporary-player-substitution-button";
import { RemoveFriendButton } from "./remove-friend-button";
import { TemporaryPlayerSubstituteRequestDialog } from "./temporary-player-substitute-request-dialog";
import { ReplaceTemporaryPlayerButton } from "./replace-temporary-player-button";

// TYPES
import type { typesUser } from "@/types/typesUser";

type TemporaryPlayerActionsProps = {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    player: typesUser;
    currentUserId: string;
    isUserInMatch: boolean;
    isAdmin: boolean;
}

export const TemporaryPlayerActions = ({
    matchIdFromParams,
    teamNumber,
    player,
    currentUserId,
    isUserInMatch,
    isAdmin
}: TemporaryPlayerActionsProps) => {
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);

    const canRemoveTemporaryPlayer = player.temporaryPlayer?.added_by === currentUserId || isAdmin;

    return (
        <div className="flex items-center space-x-2 relative z-10 mt-2 sm:mt-0">
            {canRemoveTemporaryPlayer && !isAdmin ? (
                player.temporaryPlayer?.substitute_requested ? (
                    <CancelTemporaryPlayerSubstitutionButton
                        matchIdFromParams={matchIdFromParams}
                        temporaryPlayerId={player.temporaryPlayer.id}
                    />
                ) : (
                    <RemoveFriendButton
                        matchIdFromParams={matchIdFromParams}
                        temporaryPlayerId={player.temporaryPlayer?.id as string}
                        setShowSubstituteDialog={setShowSubstituteDialog}
                    />
                )
            ) : (player.temporaryPlayer?.substitute_requested && !isUserInMatch) && (
                <ReplaceTemporaryPlayerButton
                    player={player}
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                />
            )}

            {showSubstituteDialog && (
                <TemporaryPlayerSubstituteRequestDialog
                    matchIdFromParams={matchIdFromParams}
                    temporaryPlayerId={player.temporaryPlayer?.id as string}
                    setShowSubstituteDialog={setShowSubstituteDialog}
                />
            )}
        </div>
    )
}