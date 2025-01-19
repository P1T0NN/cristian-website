"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// ACTIONS
import { switchTeamColors } from "../../actions/server_actions/switchTeamColors";

// LUCIDE ICONS
import { ArrowLeftRight } from "lucide-react";

interface SwapColorsButtonProps {
    matchIdFromParams: string;
}

export const SwapColorsButton = ({
    matchIdFromParams
}: SwapColorsButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleToggleColor = () => {
        startTransition(async () => {
            const response = await switchTeamColors({ matchIdFromParams: matchIdFromParams, teamNumber: 1 });
            
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggleColor}
            disabled={isPending}
            className="mx-auto w-fit mb-4"
        >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {t('swapColors')}
        </Button>
    )
}