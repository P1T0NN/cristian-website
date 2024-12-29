// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HasPaidButton } from "./has-paid-button";
import { HasDiscountButton } from "./has-discount-button";
import { HasGratisButton } from "./has-gratis-button";
import { SwitchTeamButton } from "./switch-team-button";
import { AddPlayerMatchAdminButton } from "./add-player-match-admin-button";
import { ShowAdminModalButton } from "./show-admin-modal-button";

// ACTIONS
import { fetchCurrentUserMatchAdmin } from "@/actions/user/fetchCurrentUserMatchAdmin";
import { getUser } from "@/actions/auth/verifyAuth";

// UTILS
import { getPositionLabel } from "@/utils/next-intl/getPlayerPositionLabel";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { UserMinus, Percent, Wallet } from 'lucide-react';

type PlayerInfoProps = {
    matchIdFromParams: string;
    player: typesUser;
    teamNumber: 0 | 1 | 2;
    areDefaultTeams: boolean;
}

export const PlayerInfo = async ({ 
    matchIdFromParams,
    player,
    teamNumber,
    areDefaultTeams
}: PlayerInfoProps) => {
    const [t, currentUserData, serverCurrentUserMatchAdmin] = await Promise.all([
        getTranslations("MatchPage"),
        getUser() as Promise<typesUser>,
        fetchCurrentUserMatchAdmin(matchIdFromParams)
    ]);
    
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data?.hasMatchAdmin as boolean;

    const nameColor = player.matchPlayer?.has_paid ? "text-green-500" : "text-red-500";

    const showPaymentControls = currentUserData.isAdmin || currentUserMatchAdmin;

    const getDisplayName = (fullName: string) => {
        if (currentUserData.isAdmin) {
            return fullName;
        }

        const nameParts = fullName.split(' ');

        if (nameParts.length > 1) {
            const firstName = nameParts[0];
            const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
            return `${firstName} ${lastNameInitial}.`;
        }

        return fullName;
    };

    const displayName = getDisplayName(player.fullName);
    const playerPosition = await getPositionLabel(player.player_position || '');

    const hasEnteredWithBalance = player.matchPlayer?.has_entered_with_balance;

    return (
        <div className="flex flex-col w-full sm:w-auto">
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

                        {displayName}

                        {player.matchPlayer?.has_match_admin && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="secondary" className="ml-2">
                                            {t('organizador')}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('organizadorTooltip')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {(currentUserData.isAdmin || currentUserMatchAdmin) && hasEnteredWithBalance && (
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
                <div className="flex flex-wrap mt-2 gap-2">
                    {/* Fine to pass player object here, since there is no sensitive data in match_players table */}
                    <HasPaidButton 
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />

                    {/* Fine to pass player object here, since there is no sensitive data in match_players table */}
                    <HasDiscountButton
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />

                    {/* Fine to pass player object here, since there is no sensitive data in match_players table */}
                    <HasGratisButton
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />
                    {(currentUserData.isAdmin || currentUserMatchAdmin) && teamNumber !== 0 && areDefaultTeams && (
                        // Fine to pass player object here, since there is no sensitive data in match_players table
                        <SwitchTeamButton
                            matchIdFromParams={matchIdFromParams}
                            player={player}
                        />
                    )}
                    {currentUserData.isAdmin && (
                        <>
                            {/* Fine to pass player object here, since there is no sensitive data in match_players table */}
                            <ShowAdminModalButton
                                matchIdFromParams={matchIdFromParams}
                                player={player}
                            />
                            {/* Fine to pass player object here, since there is no sensitive data in match_players table */}
                            <AddPlayerMatchAdminButton
                                matchIdFromParams={matchIdFromParams}
                                player={player}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}