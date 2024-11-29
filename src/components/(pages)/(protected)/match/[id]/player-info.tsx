// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HasPaidButton } from "./has-paid-button";
import { HasDiscountButton } from "./has-discount-button";
import { HasGratisButton } from "./has-gratis-button";
import { SwitchTeamButton } from "./switch-team-button";
import { AddPlayerMatchAdminButton } from "./add-player-match-admin-button";
import { RemoveFriendButton } from "./remove-friend-button";
import { ShowAdminModalButton } from "./show-admin-modal-button";

// UTILS
import { getPositionLabel } from "@/utils/next-intl/getPlayerPositionLabel";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { UserMinus, Percent, Wallet } from 'lucide-react';

type PlayerInfoProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
    isAdmin: boolean;
    currentUserMatchAdmin: boolean;
    teamNumber: 0 | 1 | 2;
    currentUserId: string;
}

export const PlayerInfo = async ({ 
    authToken,
    matchId,
    player, 
    isAdmin,
    currentUserMatchAdmin,
    teamNumber,
    currentUserId
}: PlayerInfoProps) => {
    const t = await getTranslations("MatchPage");

    const nameColor = (player.temporaryPlayer 
        ? player.temporaryPlayer.has_paid 
        : player.matchPlayer?.has_paid) 
        ? "text-green-500" 
        : "text-red-500";

    const showPaymentControls = isAdmin || currentUserMatchAdmin;

    const playerName = player.temporaryPlayer ? player.temporaryPlayer.name : player.fullName;
    const playerPosition = player.temporaryPlayer 
        ? t('temporaryPlayer') 
        : await getPositionLabel(player.player_position || '');

    const canRemoveTemporaryPlayer = player.temporaryPlayer && (player.temporaryPlayer.added_by === currentUserId || isAdmin);

    const hasEnteredWithBalance = player.matchPlayer?.has_entered_with_balance;

    return (
        <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${playerName}`} />
                    <AvatarFallback>{playerName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className={`font-medium ${nameColor} flex items-center`}>
                        {((player.matchPlayer?.has_discount && !player.temporaryPlayer) || 
                          (player.temporaryPlayer?.has_discount)) && (
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
                        {playerName}
                        {(isAdmin || currentUserMatchAdmin) && hasEnteredWithBalance && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Wallet className="text-blue-500 ml-1" size={16} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('enteredWithBalance')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </span>
                    <p className="text-sm text-muted-foreground">{playerPosition}</p>
                    {player.temporaryPlayer && player.temporaryPlayer.added_by_name && (
                        <p className="text-xs text-muted-foreground">{t('addedBy', { name: player.temporaryPlayer.added_by_name })}</p>
                    )}
                </div>
                {player.matchPlayer?.substitute_requested && !player.temporaryPlayer && (
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
                {canRemoveTemporaryPlayer && (
                    <RemoveFriendButton
                        authToken={authToken}
                        matchId={matchId}
                        player={player}
                    />
                )}
            </div>
            {showPaymentControls && (
                <div className="flex flex-wrap mt-2 gap-2">
                    <HasPaidButton 
                        authToken={authToken}
                        matchId={matchId}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />
                    <HasDiscountButton
                        authToken={authToken}
                        matchId={matchId}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />
                    <HasGratisButton
                        authToken={authToken}
                        matchId={matchId}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />
                    {isAdmin && (
                        <>
                           {teamNumber !== 0 && (
                                <SwitchTeamButton
                                    authToken={authToken}
                                    matchId={matchId}
                                    player={player}
                                />
                            )}
                            {!player.temporaryPlayer && (
                                <ShowAdminModalButton
                                    authToken={authToken}
                                    matchId={matchId}
                                    player={player}
                                />
                            )}
                            {!player.temporaryPlayer && (
                                <AddPlayerMatchAdminButton
                                    authToken={authToken}
                                    matchId={matchId}
                                    player={player}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}