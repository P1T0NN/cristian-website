"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { SubstituteRequestDialog } from "./substitute-request-dialog";
import { AdminActionsDialog } from "./admin-actions-dialog";
import { PlayerInfo } from "./player-info";
import { toast } from "sonner";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";
import { updatePaymentStatus } from "@/actions/server_actions/mutations/match/updatePaymentStatus";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";
import { adminToggleMatchAdmin } from "@/actions/server_actions/mutations/match/adminToggleMatchAdmin";

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
    const t = useTranslations("MatchPage");
    
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [isLeavePending, startLeaveTransition] = useTransition();
    const [isReplacePending, startReplaceTransition] = useTransition();
    const [isPaymentPending, startPaymentTransition] = useTransition();
    const [isMatchAdminPending, startIsMatchAdminPending] = useTransition();

    const handleLeaveTeam = () => {
        if (player.matchPlayer?.substitute_requested) {
            toast.error(t('substituteAlreadyRequested'));
            return;
        }

        startLeaveTransition(async () => {
            const response = await managePlayer(
                authToken,
                matchId,
                player.id,
                teamNumber,
                'leave'
            );

            if (response.success) {
                toast.success(response.message);
            } else if (response.canRequestSubstitute) {
                setShowSubstituteDialog(true);
            } else {
                toast.error(response.message);
            }
        });
    };

    const handleReplacePlayer = () => {
        startReplaceTransition(async () => {
            const response = await managePlayer(
                authToken,
                matchId,
                player.id,
                teamNumber,
                'replacePlayer'
            );

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    const handleUpdatePaymentStatus = (status: 'paid' | 'discount' | 'gratis') => {
        startPaymentTransition(async () => {
            let hasPaid = status === 'paid' ? !player.matchPlayer?.has_paid : player.matchPlayer?.has_paid;
            let hasDiscount = status === 'discount' ? !player.matchPlayer?.has_discount : player.matchPlayer?.has_discount;
            let hasGratis = status === 'gratis' ? !player.matchPlayer?.has_gratis : player.matchPlayer?.has_gratis;

            if (status === 'gratis' && hasGratis) {
                hasPaid = true;
                hasDiscount = false;
            } else if (status === 'discount' && hasDiscount) {
                hasGratis = false;
            }

            const result = await updatePaymentStatus(
                authToken,
                matchId,
                player.id,
                hasPaid || false,
                hasDiscount || false,
                hasGratis || false,
                currentUserMatchAdmin
            );

            if (result.success) {
                toast.success(t('paymentStatusUpdated'));
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleToggleMatchAdmin = () => {
        startIsMatchAdminPending(async () => {
            const response = await adminToggleMatchAdmin(authToken, matchId, player.id);

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        })
    }

    return (
        <div 
            className="flex items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out"
        >
            <PlayerInfo 
                player={player}
                isAdmin={isAdmin}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                isPaymentPending={isPaymentPending}
                onOpenAdminDialog={() => setShowAdminModal(true)}
                currentUserMatchAdmin={currentUserMatchAdmin}
                handleToggleMatchAdmin={handleToggleMatchAdmin}
                isMatchAdminPending={isMatchAdminPending}
            />

            <div className="flex items-center space-x-2 relative z-10">
                {isCurrentUser ? (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLeaveTeam}
                        disabled={isLeavePending}
                    >
                        {isLeavePending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('leaving')}
                            </>
                        ) : (
                            t('leaveTeam')
                        )}
                    </Button>
                ) : player.matchPlayer?.substitute_requested && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleReplacePlayer}
                        disabled={isReplacePending}
                        className="text-white bg-yellow-500 hover:bg-yellow-500/80"
                    >
                        {isReplacePending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('replacing')}
                            </>
                        ) : (
                            t('replace')
                        )}
                    </Button>
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