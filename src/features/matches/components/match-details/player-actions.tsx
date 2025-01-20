"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// COMPONENTS
import { SubstituteRequestDialog } from "./substitute-request-dialog";
import { PlayerLeaveTeamButton } from "./player-leave-team-button";
import { PlayerReplaceButton } from "./player-replace-button";
import { CancelSubstitutionButton } from "./cancel-substitution-button";
import { PlayerActionsDialog } from "./player-actions-dialog";
import { SwitchTeamButton } from "./switch-team-button";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { updatePlayerPaymentStatus } from "../../actions/server_actions/updatePlayerPaymentStatus";
import { updatePlayerMatchAdmin } from "../../actions/server_actions/updatePlayerMatchAdmin";

// LUCIDE ICONS
import { DollarSign, Percent, Gift, User, Shield } from "lucide-react";

type PlayerActionsProps = {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    matchPlayerId: string;
    playerId: string;
    playerType: "regular" | "temporary";
    playerSubRequested: boolean;
    currentUserId: string;
    isUserInMatch: boolean;
    isCurrentUserAdmin: boolean;
    addedByUserId?: string;
    hasPaid: boolean;
    hasDiscount: boolean;
    hasGratis: boolean;
    hasMatchAdmin: boolean;
    userHasMatchAdmin: boolean;
}

export const PlayerActions = ({
    matchIdFromParams,
    teamNumber,
    matchPlayerId,
    playerId,
    playerType,
    playerSubRequested,
    currentUserId,
    isUserInMatch,
    isCurrentUserAdmin,
    addedByUserId,
    hasPaid,
    hasDiscount,
    hasGratis,
    hasMatchAdmin,
    // This is passed to PlayerItem and onto PlayerActions so we can see when user has_match_admin to true, he can see for everyone
    // payment options
    userHasMatchAdmin
}: PlayerActionsProps) => {
    const [isPending, startTransition] = useTransition();

    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
    const [showActionsDialog, setShowActionsDialog] = useState(false);

    // Update this check to handle temporary players correctly
    const isCurrentUser = playerType === "regular" ? 
        playerId === currentUserId : 
        addedByUserId === currentUserId;

    const handlePaymentStatusChange = (type: 'paid' | 'discount' | 'gratis') => {
        startTransition(async () => {
            const response = await updatePlayerPaymentStatus({
                matchIdFromParams,
                matchPlayerId: matchPlayerId,
                type,
                currentValue: type === 'paid' ? hasPaid : type === 'discount' ? hasDiscount : hasGratis
            });

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    const handleMatchAdminChange = () => {
        startTransition(async () => {
            const response = await updatePlayerMatchAdmin({
                matchIdFromParams,
                matchPlayerId: matchPlayerId,
                isCurrentUserAdmin: isCurrentUserAdmin
            });

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };
    
    return (
        <div className="flex flex-col space-y-2">
            {/* First row: Admin and payment buttons */}
            <div className="flex flex-wrap gap-2">
                {isCurrentUserAdmin && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className={`${hasMatchAdmin ? 'bg-purple-500 text-white hover:bg-purple-600' : ''}`}
                            onClick={handleMatchAdminChange}
                            disabled={isPending}
                        >
                            <Shield className={hasMatchAdmin ? 'text-white' : ''} />
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setShowActionsDialog(true)}
                        >
                            <User />
                        </Button>
                    </>
                )}

                {(isCurrentUserAdmin || userHasMatchAdmin) && (
                    <>
                        <Button
                            size="sm"
                            variant="outline"
                            className={`${hasPaid ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
                            onClick={() => handlePaymentStatusChange('paid')}
                            disabled={isPending || hasGratis}
                        >
                            <DollarSign />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className={`${hasDiscount ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}`}
                            onClick={() => handlePaymentStatusChange('discount')}
                            disabled={isPending || hasGratis}
                        >
                            <Percent />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className={`${hasGratis ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                            onClick={() => handlePaymentStatusChange('gratis')}
                            disabled={isPending || hasPaid || hasDiscount}
                        >
                            <Gift />
                        </Button>

                        {(teamNumber === 1 || teamNumber === 2) && (
                            <SwitchTeamButton 
                                matchIdFromParams={matchIdFromParams}
                                matchPlayerId={matchPlayerId}
                                playerType={playerType}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Second row: Player actions */}
            <div className="flex flex-wrap gap-2">
                {isCurrentUser && (
                    playerSubRequested ? (
                        <CancelSubstitutionButton 
                            matchIdFromParams={matchIdFromParams}
                            matchPlayerId={matchPlayerId}
                            playerType={playerType}
                        />
                    ) : (
                        <PlayerLeaveTeamButton 
                            matchIdFromParams={matchIdFromParams}
                            setShowSubstituteDialog={setShowSubstituteDialog}
                            matchPlayerId={matchPlayerId}
                            playerType={playerType}
                        />
                    )
                )}
                
                {!isCurrentUser && playerSubRequested && !isUserInMatch && (
                    <PlayerReplaceButton
                        matchIdFromParams={matchIdFromParams}
                        matchPlayerId={matchPlayerId}
                        teamNumber={teamNumber}
                    />
                )}
            </div>

            {/* Dialogs */}
            {showSubstituteDialog && (
                <SubstituteRequestDialog
                    matchIdFromParams={matchIdFromParams}
                    setShowSubstituteDialog={setShowSubstituteDialog}
                    matchPlayerId={matchPlayerId}
                    playerType={playerType}
                />
            )}

            {showActionsDialog && (
                <PlayerActionsDialog 
                    matchPlayerId={matchPlayerId}
                    playerId={playerId}
                    playerType={playerType}
                    isAdmin={isCurrentUserAdmin}
                    matchIdFromParams={matchIdFromParams}
                    isOpen={showActionsDialog}
                    setIsOpen={setShowActionsDialog}
                />
            )}
        </div>
    );
};