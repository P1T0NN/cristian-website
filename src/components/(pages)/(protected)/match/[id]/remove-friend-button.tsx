"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { removeFriend } from "@/actions/server_actions/mutations/match/removeFriend";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { X } from "lucide-react";

type RemoveFriendButtonProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
}

export const RemoveFriendButton = ({
    authToken,
    matchId,
    player
}: RemoveFriendButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleRemoveTemporaryPlayer = () => {
        startTransition(async () => {
            const result = await removeFriend(authToken, matchId, player.temporaryPlayer!.id);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveTemporaryPlayer}
                        disabled={isPending}
                    >
                        <X size={14} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('removeTemporaryPlayer')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}