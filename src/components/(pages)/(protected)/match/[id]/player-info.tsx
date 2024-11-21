"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PaymentStatusButton } from "./payment-status-button";
import { Button } from "@/components/ui/button";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { UserMinus, Gift, Percent, DollarSign, User } from 'lucide-react';

type PlayerInfoProps = {
    player: typesUser;
    isAdmin: boolean;
    onUpdatePaymentStatus: (status: 'paid' | 'discount' | 'gratis') => void;
    isPaymentPending: boolean;
    onOpenAdminDialog: () => void;
}

export const PlayerInfo = ({ 
    player, 
    isAdmin, 
    onUpdatePaymentStatus, 
    isPaymentPending,
    onOpenAdminDialog,
}: PlayerInfoProps) => {
    const t = useTranslations("MatchPage");
    const nameColor = player.matchPlayer?.has_paid ? "text-green-500" : "text-red-500";

    const handleUpdatePaymentStatus = (e: React.MouseEvent, status: 'paid' | 'discount' | 'gratis') => {
        e.preventDefault();
        onUpdatePaymentStatus(status);
    };

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
            {isAdmin && (
                <div className="flex mt-2 space-x-2">
                    <PaymentStatusButton
                        status="paid"
                        isActive={player.matchPlayer?.has_paid}
                        onClick={(e) => handleUpdatePaymentStatus(e, 'paid')}
                        icon={<DollarSign size={16} />}
                        activeClass="bg-blue-500 hover:bg-blue-600 text-white"
                        tooltipText={player.matchPlayer?.has_paid ? t('markAsUnpaid') : t('markAsPaid')}
                        disabled={isPaymentPending}
                    />
                    <PaymentStatusButton
                        status="discount"
                        isActive={player.matchPlayer?.has_discount}
                        onClick={(e) => handleUpdatePaymentStatus(e, 'discount')}
                        icon={<Percent size={16} />}
                        activeClass="bg-yellow-500 hover:bg-yellow-600 text-white"
                        tooltipText={player.matchPlayer?.has_discount ? t('removeDiscount') : t('applyDiscount')}
                        disabled={isPaymentPending || player.matchPlayer?.has_gratis}
                    />
                    <PaymentStatusButton
                        status="gratis"
                        isActive={player.matchPlayer?.has_gratis}
                        onClick={(e) => handleUpdatePaymentStatus(e, 'gratis')}
                        icon={<Gift size={16} />}
                        activeClass="bg-green-500 hover:bg-green-600 text-white"
                        tooltipText={player.matchPlayer?.has_gratis ? t('removeGratis') : t('markAsGratis')}
                        disabled={isPaymentPending}
                    />
                    <Button
                        className="w-10 h-10"
                        onClick={onOpenAdminDialog}
                    >
                        <User size={16} />
                    </Button>
                </div>
            )}
        </div>
    )
}