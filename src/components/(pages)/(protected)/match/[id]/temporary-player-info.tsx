// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HasPaidButton } from "./has-paid-button";
import { HasDiscountButton } from "./has-discount-button";
import { HasGratisButton } from "./has-gratis-button";
import { SwitchTeamButton } from "./switch-team-button";
import { RemoveTemporaryPlayerButton } from "./remove-temporary-player-button";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchCurrentUserMatchAdmin } from "@/actions/user/fetchCurrentUserMatchAdmin";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Percent, Phone, UserMinus } from 'lucide-react';

type TemporaryPlayerInfoProps = {
    matchIdFromParams: string;
    player: typesUser;
    teamNumber: 0 | 1 | 2;
    isDefaultTeam: boolean;
}

export const TemporaryPlayerInfo = async ({ 
    matchIdFromParams,
    player,
    teamNumber,
    isDefaultTeam
}: TemporaryPlayerInfoProps) => {
    const t = await getTranslations("MatchPage");

    const currentUserData = await getUser() as typesUser;

    const serverCurrentUserMatchAdmin = await fetchCurrentUserMatchAdmin(matchIdFromParams);
    const currentUserMatchAdmin = serverCurrentUserMatchAdmin.data?.isAdmin as boolean;

    const nameColor = player.temporaryPlayer?.has_paid ? "text-green-500" : "text-red-500";

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

    const displayName = getDisplayName(player.temporaryPlayer?.name || '');

    return (
        <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.temporaryPlayer?.name}`} />
                    <AvatarFallback>{player.temporaryPlayer?.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                    <span className={`font-medium ${nameColor} flex items-center`}>
                        {player.temporaryPlayer?.has_discount && (
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
                    </span>

                    <p className="text-sm text-muted-foreground">{t('temporaryPlayer')}</p>

                    {player.temporaryPlayer?.added_by_name && (
                        <p className="text-xs text-muted-foreground">{t('addedBy', { name: getDisplayName(player.temporaryPlayer.added_by_name) })}</p>
                    )}

                    {currentUserData.isAdmin && player.temporaryPlayer?.phone_number && (
                        <p className="text-xs text-muted-foreground flex items-center">
                            <Phone className="mr-1" size={12} />
                            {player.temporaryPlayer.phone_number}
                        </p>
                    )}
                </div>

                {player.temporaryPlayer?.substitute_requested && (
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
                    <HasPaidButton 
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />

                    <HasDiscountButton
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />

                    <HasGratisButton
                        matchIdFromParams={matchIdFromParams}
                        currentUserMatchAdmin={currentUserMatchAdmin}
                        player={player}
                    />

                    {currentUserData.isAdmin && teamNumber !== 0 && isDefaultTeam && (
                        <SwitchTeamButton
                            matchIdFromParams={matchIdFromParams}
                            player={player}
                        />
                    )}

                    {currentUserData.isAdmin && (
                        <RemoveTemporaryPlayerButton
                            matchIdFromParams={matchIdFromParams}
                            player={player}
                        />
                    )}
                </div>
            )}
        </div>
    )
}