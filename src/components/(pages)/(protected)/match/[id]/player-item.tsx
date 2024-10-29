"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TYPES
import type { typesUser } from "@/types/typesUser";

type PlayerItemProps = {
    player: typesUser;
    isCurrentUser: boolean;
    onLeave: () => void;
}

export const PlayerItem = ({ 
    player, 
    isCurrentUser, 
    onLeave 
}: PlayerItemProps) => {
    const t = useTranslations("MatchPage");

    return (
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${player.fullName}`} />
                    <AvatarFallback>{player.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{player.fullName}</span>
            </div>
            {isCurrentUser && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLeave}
                >
                    {t('leaveTeam')}
                </Button>
            )}
        </div>
    );
};