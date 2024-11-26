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
import { managePlayer } from "@/actions/server_actions/mutations/match/managePlayer";

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
            const result = await managePlayer(
                authToken,
                matchId,
                player.id,
                player.matchPlayer?.team_number === 1 ? 2 : 1,
                'switchTeam'
            );

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