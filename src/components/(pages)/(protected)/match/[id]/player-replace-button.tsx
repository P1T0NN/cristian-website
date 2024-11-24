"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type PlayerReplaceButtonProps = {
    authToken: string;
    player: typesUser;
    matchId: string;
    teamNumber: 1 | 2;
}

export const PlayerReplaceButton = ({
    authToken,
    player,
    matchId,
    teamNumber
}: PlayerReplaceButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

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
        });
    };

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleReplacePlayer}
            disabled={isPending}
            className="text-white bg-yellow-500 hover:bg-yellow-500/80"
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
    )
}