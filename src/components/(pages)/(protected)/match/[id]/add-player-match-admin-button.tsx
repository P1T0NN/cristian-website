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
import { adminToggleMatchAdmin } from "@/actions/server_actions/mutations/match/adminToggleMatchAdmin";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Shield } from "lucide-react";

type AddPlayerMatchAdminButtonProps = {
    authToken: string;
    matchId: string;
    player: typesUser;
}

export const AddPlayerMatchAdminButton = ({
    authToken,
    matchId,
    player
}: AddPlayerMatchAdminButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleToggleMatchAdmin = () => {
        startTransition(async () => {
            const response = await adminToggleMatchAdmin(authToken, matchId, player.id);

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        })
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${player.matchPlayer?.has_match_admin ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                        onClick={handleToggleMatchAdmin}
                        disabled={isPending}
                    >
                        <Shield size={14} className="text-white sm:h-4 sm:w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{player.matchPlayer?.has_match_admin ? t('removeMatchAdmin') : t('makeMatchAdmin')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}