// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { PlayerActions } from "./player-actions";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// UTILS
import { formatPlayerInitials, isRegularPlayer } from "@/features/players/utils/playerUtils";

// TYPES
import type { typesPlayer, typesUser } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { UserMinus } from "lucide-react";

type PlayerItemProps = {
    player: typesPlayer;
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    isUserInMatch: boolean;
    areDefaultTeams?: boolean;
    userHasMatchAdmin: boolean; 
}

export const PlayerItem = async ({ 
    player, 
    matchIdFromParams,
    teamNumber,
    isUserInMatch,
    userHasMatchAdmin
}: PlayerItemProps) => {
    const t = await getTranslations("MatchPage");
    const currentUserData = await getUser() as typesUser;

    const displayName = isRegularPlayer(player) 
        ? player.user.fullName 
        : (player.temporary_player_name || t('unknownPlayer'));

    const hasPaid = player.matchPlayer?.has_paid ?? false;
    const nameColor = hasPaid ? "text-green-500" : "text-red-500";

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out">
            <div className="flex flex-col w-full space-y-2 sm:w-auto">
                <div className="flex items-center space-x-2">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${displayName}`} />
                        <AvatarFallback>{formatPlayerInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                        <span className={`font-medium ${nameColor} flex items-center gap-2`}>
                            {displayName}
                            {player.matchPlayer?.substitute_requested && (
                                <UserMinus className="h-4 w-4 text-yellow-500" />
                            )}
                            {isRegularPlayer(player) && player.matchPlayer?.has_match_admin && (
                                <Badge variant="secondary" className="ml-2">
                                    {t('organizador')}
                                </Badge>
                            )}
                        </span>
                        
                        {isRegularPlayer(player) ? (
                            <p className="text-sm text-muted-foreground">
                                {player.user.player_position}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('temporaryPlayer')}
                            </p>
                        )}

                        {!isRegularPlayer(player) && player.matchPlayer?.added_by && (
                            <p className="text-xs text-muted-foreground">
                                {t('addedBy')}: {player.matchPlayer.added_by.fullName}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Client Component */}
                <PlayerActions 
                    matchIdFromParams={matchIdFromParams}
                    teamNumber={teamNumber}
                    matchPlayerId={player.matchPlayer?.id}
                    playerId={player.matchPlayer.userId}
                    playerType={isRegularPlayer(player) ? "regular" : "temporary"}
                    playerSubRequested={player.matchPlayer?.substitute_requested}
                    currentUserId={currentUserData.id}
                    isUserInMatch={isUserInMatch}
                    isCurrentUserAdmin={currentUserData.isAdmin}
                    addedByUserId={!isRegularPlayer(player) ? player.matchPlayer.userId : undefined}
                    hasPaid={player.matchPlayer?.has_paid}
                    hasDiscount={player.matchPlayer?.has_discount}
                    hasGratis={player.matchPlayer?.has_gratis}
                    hasMatchAdmin={player.matchPlayer?.has_match_admin ?? false}
                    // This is passed to PlayerItem and onto PlayerActions so we can see when user has_match_admin to true, he can see for everyone
                    // payment options
                    userHasMatchAdmin={userHasMatchAdmin}
                />
            </div>
        </div>
    );
};