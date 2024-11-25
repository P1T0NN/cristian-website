"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type PlayerLeaveTeamButtonProps = {
    authToken: string;
    player: typesUser;
    matchId: string;
    teamNumber: 0 | 1 | 2;
    setShowSubstituteDialog: (isVisible: boolean) => void;
}

export const PlayerLeaveTeamButton = ({
    authToken,
    player,
    matchId,
    teamNumber,
    setShowSubstituteDialog
}: PlayerLeaveTeamButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

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
            } else if (response.metadata && response.metadata.canRequestSubstitute) {
                setShowSubstituteDialog(true);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveTeam}
            disabled={isPending}
            className="w-full sm:w-auto"
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
    )
}