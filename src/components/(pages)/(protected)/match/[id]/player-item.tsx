"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerItemProps = {
    player: typesUser;
    isCurrentUser: boolean;
    onLeave: () => void;
    isPending?: boolean;
}

export const PlayerItem = ({ 
    player, 
    isCurrentUser, 
    onLeave,
    isPending
}: PlayerItemProps) => {
    const t = useTranslations("MatchPage");

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg transition-opacity duration-200 ease-in-out">
            <div className="flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                    <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.fullName}</span>
            </div>
            {isCurrentUser && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLeave}
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
    );
};