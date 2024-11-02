"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { switchTeamColors } from "@/actions/server_actions/mutations/match/switchTeamColors";

// LUCIDE ICONS
import { ArrowLeftRight } from "lucide-react";

type SwitchTeamColorsProps = {
    matchId: string
    authToken: string
    isAdmin: boolean
}

export const SwitchTeamColors = ({ 
    matchId, 
    authToken, 
    isAdmin,
}: SwitchTeamColorsProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleToggleColor = () => {
        startTransition(async () => {
            const response = await switchTeamColors(authToken, matchId, 1);
            
            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    }

    if (!isAdmin) return null

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