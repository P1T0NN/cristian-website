"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { switchTeam } from "../../actions/server_actions/switchTeam";

// LUCIDE ICONS
import { ArrowLeftRight } from "lucide-react";

type SwitchTeamButtonProps = {
    matchIdFromParams: string;
    matchPlayerId: string;
    playerType: "regular" | "temporary";
}

export const SwitchTeamButton = ({
    matchIdFromParams,
    matchPlayerId,
    playerType,
}: SwitchTeamButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();

    const handleSwitchTeam = () => {
        startTransition(async () => {
            const response = await switchTeam({
                matchIdFromParams,
                playerId: matchPlayerId,
                playerType: playerType
            });

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
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 hover:bg-blue-600"
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
    );
};