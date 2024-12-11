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
import { switchTeam } from "@/actions/server_actions/mutations/match/switchTeam";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { ArrowLeftRight } from "lucide-react";

type SwitchTeamButtonProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
}

export const SwitchTeamButton = ({
    authToken,
    matchId,
    player
}: SwitchTeamButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleSwitchTeam = () => {
        startTransition(async () => {
            const isTemporaryPlayer = !!player.temporaryPlayer;
            const playerId = isTemporaryPlayer ? player.temporaryPlayer?.id as string : player.id;

            const response = await switchTeam(
                authToken,
                matchId,
                playerId,
                isTemporaryPlayer
            );

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-500 hover:bg-blue-600"
                        onClick={handleSwitchTeam}
                        disabled={isPending}
                    >
                        <ArrowLeftRight size={14} className="text-white sm:h-4 sm:w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('switchTeam')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}