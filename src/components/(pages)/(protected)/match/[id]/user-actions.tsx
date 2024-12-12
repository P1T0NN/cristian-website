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
    authToken: string;
    matchId: string;
    teamNumber: 0 | 1 | 2;
    player: typesUser;
    isCurrentUser: boolean;
    isUserInMatch: boolean;
    isAdmin: boolean;
}

export const UserActions = ({
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
            {isCurrentUser && !isAdmin && (
                player.matchPlayer?.substitute_requested ? (
                    <CancelSubstitutionButton 
                        authToken={authToken}
                        matchId={matchId}
                    />
                ) : (
                    <PlayerLeaveTeamButton 
                        authToken={authToken}
                        matchId={matchId}
                        setShowSubstituteDialog={setShowSubstituteDialog}
                    />
                )
            )}
            {!isCurrentUser && player.matchPlayer?.substitute_requested && !isUserInMatch && (
                <PlayerReplaceButton
                    authToken={authToken}
                    player={player}
                    matchId={matchId}
                    teamNumber={teamNumber}
                />
            )}

            {showSubstituteDialog && (
                <SubstituteRequestDialog
                    authToken={authToken}
                    matchId={matchId}
                    setShowSubstituteDialog={setShowSubstituteDialog}
                />
            )}
        </div>
    )
}