"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";
import { PAGE_ENDPOINTS } from "@/config";

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

    const handleLeaveTeam = () => {
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
        </div>
    )

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out">
            {isAdmin ? (
                <Link href={`${PAGE_ENDPOINTS.PLAYER_PAGE}/${player.id}`} className="flex items-center space-x-2">
                    <PlayerInfo />
                </Link>
            ) : (
                <div className="flex items-center space-x-2">
                    <PlayerInfo />
                </div>
            )}
            {isCurrentUser && (
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
            )}
        </div>
    )
}