// LIBRARIES
import { cn } from "@/shared/lib/utils";
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { HasPaidButton } from "./has-paid-button";
import { HasGratisButton } from "./has-gratis-button";
import { HasDiscountButton } from "./has-discount-button";
import { SwapPlayerTeamButton } from "./swap-player-team-button";
import { AdminRemovePlayerFromMatchButton } from "./admin-remove-player-from-match-button";
import { ReplacePlayerButton } from "./replace-player-button";
import { MatchAdminButton } from "./match-admin-button";
import { MatchTeamsPlayerSlotEmpty } from "./match-teams-player-slot-empty";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { formatPlayerPositionLocalizedSync } from "@/features/players/utils/playerUtils";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesPlayer } from "@/features/matches/types/typesMatch";

// LUCIDE ICONS
import { MoreVertical, UserMinus } from "lucide-react";

interface MatchTeamsPlayerSlotProps {
    id?: string;
    teamColor: "red" | "blue";
    matchIdFromParams?: string;
    locale?: string;
    player?: typesPlayer;
    isMatchAdmin?: boolean;
    isBlocked?: boolean;
}

export const MatchTeamsPlayerSlot = async ({ 
    id,
    teamColor,
    matchIdFromParams,
    locale,
    player,
    isMatchAdmin,
    isBlocked
}: MatchTeamsPlayerSlotProps) => {
    const t = await getTranslations("MatchPage");

    const currentUserData = await getUser() as typesUser;

    // Show admin controls if user is either global admin or match admin
    const canAccessAdminControls = currentUserData.isAdmin || isMatchAdmin;

    // If it's an empty slot
    if (!player) {
        return <MatchTeamsPlayerSlotEmpty 
            teamColor={teamColor} 
            isBlocked={isBlocked as boolean} 
        />
    }

    return (
        <div
            className={cn(
                "flex items-center justify-between p-4 rounded-xl",
                "transition-colors duration-200"
            )}
        >
            <div className="flex items-center space-x-4">
                <Avatar className={cn(teamColor === "red" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                    <AvatarFallback className="text-lg font-medium">{player?.name?.[0]}</AvatarFallback>
                </Avatar>

                <div>
                    <div className="flex items-center gap-2 font-medium">
                        <p>{player?.name}</p>
                        
                        {player?.hasMatchAdmin && (
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                teamColor === "red" 
                                    ? "bg-red-100/10 text-red-500" 
                                    : "bg-blue-100/10 text-blue-500"
                            )}>
                                {t('organizer')}
                            </span>
                        )}
                        
                        {player?.substituteRequested && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <UserMinus className="h-4 w-4 text-yellow-500" />
                                    </TooltipTrigger>
                                    
                                    <TooltipContent>
                                        <p>{t('substituteRequested')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <div className={cn(
                        "text-sm",
                        player?.playerPosition?.startsWith('Added by') 
                            ? "italic text-gray-500"
                            : teamColor === "red" ? "text-red-600/60" : "text-blue-600/60"
                    )}>
                        {player?.playerPosition?.startsWith('Added by') 
                            ? player?.playerPosition 
                            : formatPlayerPositionLocalizedSync(player?.playerPosition as string, locale as string)
                        }
                    </div>
                    {/* Status indicators */}
                    <div className="flex gap-2 mt-1">
                        {player?.hasPaid && <span className="text-xs text-green-500">{t("paid")}</span>}
                        {player?.hasGratis && <span className="text-xs text-blue-500">{t("gratis")}</span>}
                        {player?.hasDiscount && <span className="text-xs text-yellow-500">{t("discount")}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {player?.substituteRequested && id && (player?.userId !== currentUserData.id) && (
                    <ReplacePlayerButton 
                        matchIdFromParams={matchIdFromParams as string}
                        playerToReplaceId={id}
                    />
                )}
                
                {/* Show admin controls for both global admins and match admins */}
                {canAccessAdminControls && id && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        
                        <DropdownMenuContent align="end">
                            {/* Only global admins can manage match admin status */}
                            {currentUserData.isAdmin && player?.playerType === 'regular' && (
                                <MatchAdminButton 
                                    id={id}
                                    matchIdFromParams={matchIdFromParams as string}
                                    isMatchAdmin={player?.hasMatchAdmin as boolean}
                                />
                            )}
                            <SwapPlayerTeamButton 
                                id={id}
                                matchIdFromParams={matchIdFromParams as string}
                                playerType={player?.playerType as 'regular' | 'temporary'}
                            />
                            <AdminRemovePlayerFromMatchButton 
                                id={id}
                                matchIdFromParams={matchIdFromParams as string}
                                playerType={player?.playerType as 'regular' | 'temporary'}
                            />
                            <HasPaidButton 
                                id={id}
                                matchIdFromParams={matchIdFromParams as string}
                                hasPaid={player?.hasPaid as boolean}
                            />
                            <HasGratisButton
                                id={id}
                                matchIdFromParams={matchIdFromParams as string}
                                hasGratis={player?.hasGratis as boolean}
                            />
                            <HasDiscountButton
                                id={id}
                                matchIdFromParams={matchIdFromParams as string}
                                hasDiscount={player?.hasDiscount as boolean}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}