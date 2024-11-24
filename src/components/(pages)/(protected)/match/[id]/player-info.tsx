"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PaymentStatusButton } from "./payment-status-button";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { updatePaymentStatus } from "@/actions/server_actions/mutations/match/updatePaymentStatus";
import { adminToggleMatchAdmin } from "@/actions/server_actions/mutations/match/adminToggleMatchAdmin";
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { UserMinus, Gift, Percent, DollarSign, User, Shield, ArrowLeftRight } from 'lucide-react';

type PlayerInfoProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
    isAdmin: boolean;
    currentUserMatchAdmin: boolean;
    handleShowAdminModal: () => void;
}

export const PlayerInfo = ({ 
    authToken,
    matchId,
    player, 
    isAdmin,
    currentUserMatchAdmin,
    handleShowAdminModal
}: PlayerInfoProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = (status: 'paid' | 'discount' | 'gratis') => {
        startTransition(async () => {
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
        startTransition(async () => {
            const response = await adminToggleMatchAdmin(authToken, matchId, player.id);

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        })
    }

    const handleSwitchTeam = () => {
        startTransition(async () => {
            const result = await managePlayer(
                authToken,
                matchId,
                player.id,
                player.matchPlayer?.team_number === 1 ? 2 : 1,
                'switchTeam'
            );

            if (result.success) {
                toast.success(t('playerSwitchedTeam'));
            } else {
                toast.error(result.message);
            }
        });
    };

    const nameColor = player.matchPlayer?.has_paid ? "text-green-500" : "text-red-500";
    const showPaymentControls = isAdmin || currentUserMatchAdmin;

    return (
        <div className="flex flex-col">
            <div className="flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                    <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className={`font-medium ${nameColor} flex items-center`}>
                        {player.matchPlayer?.has_discount && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Percent className="text-yellow-500 mr-1" size={16} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('hasDiscount')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {player.fullName}
                    </span>
                    <p className="text-sm text-muted-foreground">{player.player_position}</p>
                </div>
                {player.matchPlayer?.substitute_requested && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <UserMinus className="text-yellow-500" size={20} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('substituteRequested')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {showPaymentControls && (
                <div className="flex mt-2 space-x-2">
                    <PaymentStatusButton
                        status="paid"
                        isActive={player.matchPlayer?.has_paid}
                        onClick={() => handleUpdatePaymentStatus('paid')}
                        icon={<DollarSign size={16} />}
                        activeClass="bg-blue-500 hover:bg-blue-600 text-white"
                        tooltipText={player.matchPlayer?.has_paid ? t('markAsUnpaid') : t('markAsPaid')}
                        disabled={isPending}
                    />
                    <PaymentStatusButton
                        status="discount"
                        isActive={player.matchPlayer?.has_discount}
                        onClick={() => handleUpdatePaymentStatus('discount')}
                        icon={<Percent size={16} />}
                        activeClass="bg-yellow-500 hover:bg-yellow-600 text-white"
                        tooltipText={player.matchPlayer?.has_discount ? t('removeDiscount') : t('applyDiscount')}
                        disabled={isPending || player.matchPlayer?.has_gratis}
                    />
                    <PaymentStatusButton
                        status="gratis"
                        isActive={player.matchPlayer?.has_gratis}
                        onClick={() => handleUpdatePaymentStatus('gratis')}
                        icon={<Gift size={16} />}
                        activeClass="bg-green-500 hover:bg-green-600 text-white"
                        tooltipText={player.matchPlayer?.has_gratis ? t('removeGratis') : t('markAsGratis')}
                        disabled={isPending}
                    />
                    {isAdmin && (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="w-10 h-10 bg-blue-500 hover:bg-blue-600"
                                            onClick={handleSwitchTeam}
                                            disabled={isPending}
                                        >
                                            <ArrowLeftRight size={16} className="text-white" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('switchTeam')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button
                                className="w-10 h-10"
                                onClick={handleShowAdminModal}
                            >
                                <User size={16} />
                            </Button>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className={`w-10 h-10 ${player.matchPlayer?.has_match_admin ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                                            onClick={handleToggleMatchAdmin}
                                            disabled={isPending}
                                        >
                                            <Shield size={16} className="text-white" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{player.matchPlayer?.has_match_admin ? t('removeMatchAdmin') : t('makeMatchAdmin')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}