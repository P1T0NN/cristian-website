"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

// SERVER ACTIONS
import { switchTeam } from "../../actions/server_actions/switchTeam";

// LUCIDE ICONS
import { ArrowLeftRight } from "lucide-react";

interface SwapPlayerTeamButtonProps {
    id: string;
    matchIdFromParams: string;
    playerType: 'regular' | 'temporary';
}

export const SwapPlayerTeamButton = ({
    id,
    matchIdFromParams,
    playerType
}: SwapPlayerTeamButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();

    const handleSwapTeam = () => {
        startTransition(async () => {
            const result = await switchTeam({
                matchIdFromParams,
                playerId: id,
                playerType
            });

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
                        variant="outline" 
                        size="icon"
                        className="h-10 w-10"
                        onClick={handleSwapTeam}
                        disabled={isPending}
                    >
                        <ArrowLeftRight className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isPending ? t('swappingTeam') : t('swapTeam')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};