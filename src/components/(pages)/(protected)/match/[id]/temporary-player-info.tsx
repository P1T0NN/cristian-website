// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HasPaidButton } from "./has-paid-button";
import { HasDiscountButton } from "./has-discount-button";
import { HasGratisButton } from "./has-gratis-button";
import { SwitchTeamButton } from "./switch-team-button";
import { RemoveFriendButton } from "./remove-friend-button";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Percent, Phone } from 'lucide-react';

type TemporaryPlayerInfoProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
    isAdmin: boolean;
    currentUserMatchAdmin: boolean;
    teamNumber: 0 | 1 | 2;
    currentUserId: string;
    isDefaultTeam: boolean;
}

export const TemporaryPlayerInfo = async ({ 
    authToken,
    matchId,
    player, 
    isAdmin,
    currentUserMatchAdmin,
    teamNumber,
    currentUserId,
    isDefaultTeam
}: TemporaryPlayerInfoProps) => {
    const t = await getTranslations("MatchPage");

    const nameColor = player.temporaryPlayer?.has_paid ? "text-green-500" : "text-red-500";

    const showPaymentControls = isAdmin || currentUserMatchAdmin;

    const getDisplayName = (fullName: string) => {
        if (isAdmin) {
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
    const canRemoveTemporaryPlayer = player.temporaryPlayer?.added_by === currentUserId || isAdmin;

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
                    {isAdmin && player.temporaryPlayer?.phone_number && (
                        <p className="text-xs text-muted-foreground flex items-center">
                            <Phone className="mr-1" size={12} />
                            {player.temporaryPlayer.phone_number}
                        </p>
                    )}
                </div>
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
                    {isAdmin && teamNumber !== 0 && !isDefaultTeam && (
                        <SwitchTeamButton
                            authToken={authToken}
                            matchId={matchId}
                            player={player}
                        />
                    )}
                </div>
            )}
        </div>
    )
}