"use client"

// REACTJS IMPORTS
import { useState } from "react";

// COMPONENTS
import { PlayerInfo } from "./player-info";
import { PlayerLeaveTeamButton } from "./player-leave-team-button";
import { PlayerReplaceButton } from "./player-replace-button";
import { AdminActionsDialog } from "./admin-actions-dialog";
import { SubstituteRequestDialog } from "./substitute-request-dialog";

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerItemProps = {
    player: typesUser;
    isCurrentUser: boolean;
    teamNumber: 1 | 2;
    matchId: string;
    isAdmin: boolean;
    authToken: string;
    currentUserMatchAdmin: boolean;
}

export const PlayerItem = ({ 
    player, 
    isCurrentUser,
    teamNumber,
    matchId,
    isAdmin,
    authToken,
    currentUserMatchAdmin,
}: PlayerItemProps) => {
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);

    const handleShowAdminModal = () => {
        setShowAdminModal(true);
    }

    return (
        <div 
            className="flex items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out"
        >
            <PlayerInfo 
                authToken={authToken}
                matchId={matchId}
                player={player}
                isAdmin={isAdmin}
                currentUserMatchAdmin={currentUserMatchAdmin}
                handleShowAdminModal={handleShowAdminModal}
            />

            <div className="flex items-center space-x-2 relative z-10">
                {isCurrentUser && !isAdmin ? (
                    <PlayerLeaveTeamButton 
                        authToken={authToken}
                        player={player}
                        matchId={matchId}
                        teamNumber={teamNumber}
                        setShowSubstituteDialog={setShowSubstituteDialog}
                    />
                ) : player.matchPlayer?.substitute_requested && (
                    <PlayerReplaceButton
                        authToken={authToken}
                        player={player}
                        matchId={matchId}
                        teamNumber={teamNumber}
                    />
                )}
            </div>

            {showSubstituteDialog && (
                <SubstituteRequestDialog
                    authToken={authToken}
                    matchId={matchId}
                    playerId={player.id}
                    onClose={() => setShowSubstituteDialog(false)}
                />
            )}

            {showAdminModal && (
                <AdminActionsDialog
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    player={player}
                    matchId={matchId}
                    authToken={authToken}
                />
            )}
        </div>
    )
}