"use client"

// REACTJS IMPORTS
import { useState } from "react";

// COMPONENTS
import { PlayerLeaveTeamButton } from "./player-leave-team-button";
import { PlayerReplaceButton } from "./player-replace-button";
import { SubstituteRequestDialog } from "./substitute-request-dialog";
import { CancelSubstitutionButton } from "./cancel-substitution-button";

// TYPES
import type { typesUser } from "@/types/typesUser";

type UserActionsProps = {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    player: typesUser;
    isCurrentUser: boolean;
    isUserInMatch: boolean;
    isAdmin: boolean;
}

export const UserActions = ({
    matchIdFromParams,
    teamNumber,
    player,
    isCurrentUser,
    isUserInMatch,
    isAdmin
}: UserActionsProps) => {
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);

    return (
        <div className="flex items-center space-x-2 relative z-10 mt-2 sm:mt-0">
            {isCurrentUser && !isAdmin && (
                player.matchPlayer?.substitute_requested ? (
                    <CancelSubstitutionButton 
                        matchIdFromParams={matchIdFromParams}
                    />
                ) : (
                    <PlayerLeaveTeamButton 
                        matchIdFromParams={matchIdFromParams}
                        setShowSubstituteDialog={setShowSubstituteDialog}
                    />
                )
            )}
            {!isCurrentUser && player.matchPlayer?.substitute_requested && !isUserInMatch && (
                <PlayerReplaceButton
                    player={player}
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                />
            )}

            {showSubstituteDialog && (
                <SubstituteRequestDialog
                    matchIdFromParams={matchIdFromParams}
                    setShowSubstituteDialog={setShowSubstituteDialog}
                />
            )}
        </div>
    )
}