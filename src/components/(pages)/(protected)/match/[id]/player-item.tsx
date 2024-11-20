"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubstituteRequestDialog } from "./substitute-request-dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2, UserMinus } from "lucide-react";

type PlayerItemProps = {
    player: typesUser;
    isCurrentUser: boolean;
    teamNumber: 1 | 2;
    matchId: string;
    isAdmin: boolean;
    authToken: string;
}

export const PlayerItem = ({ 
    player, 
    isCurrentUser,
    teamNumber,
    matchId,
    isAdmin,
    authToken
}: PlayerItemProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();
    const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);

    const handleLeaveTeam = () => {
        if (player.matchPlayer?.substitute_requested) {
            toast.error(t('substituteAlreadyRequested'));
            return;
        }

        startTransition(async () => {
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
        })
    };

    const handleReplacePlayer = () => {
        startTransition(async () => {
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
        })
    };

    const PlayerInfo = () => (
        <div className="flex items-center space-x-2">
            <Avatar>
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-medium">{player.fullName}</span>
                <p className="text-sm">{player.player_position}</p>
            </div>
            {player.matchPlayer?.substitute_requested && (
                <UserMinus className="text-yellow-500" size={20} />
            )}
        </div>
    )

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out">
            {isAdmin ? (
                <Link href={`${ADMIN_PAGE_ENDPOINTS.PLAYER_PAGE}/${player.id}`} className="flex items-center space-x-2">
                    <PlayerInfo />
                </Link>
            ) : (
                <div className="flex items-center space-x-2">
                    <PlayerInfo />
                </div>
            )}
            {isCurrentUser ? (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveTeam}
                    disabled={isPending}
                    className="min-w-[100px]"
                >
                    {isPending ? (
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
                    disabled={isPending}
                    className="min-w-[100px] text-white bg-yellow-500 hover:bg-yellow-500/80"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('replacing')}
                        </>
                    ) : (
                        t('replace')
                    )}
                </Button>
            )}

            {showSubstituteDialog && (
                <SubstituteRequestDialog
                    authToken={authToken}
                    matchId={matchId}
                    playerId={player.id}
                    onClose={() => setShowSubstituteDialog(false)}
                />
            )}
        </div>
    )
}