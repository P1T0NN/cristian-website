"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";

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
        <DropdownMenuItem
            onClick={handleSwapTeam}
            disabled={isPending}
        >
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            <span>{isPending ? t('swappingTeam') : t('swapTeam')}</span>
        </DropdownMenuItem>
    );
};