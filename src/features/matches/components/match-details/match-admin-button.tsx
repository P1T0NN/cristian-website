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

// LUCIDE ICONS
import { ShieldCheck } from "lucide-react";

// SERVER ACTIONS
import { toggleMatchAdmin } from "../../actions/server_actions/toggleMatchAdmin";

interface MatchAdminButtonProps {
    id: string;
    matchIdFromParams: string;
    isMatchAdmin: boolean;
}

export const MatchAdminButton = ({
    id,
    matchIdFromParams,
    isMatchAdmin
}: MatchAdminButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();

    const handleToggleMatchAdmin = () => {
        startTransition(async () => {
            const result = await toggleMatchAdmin({
                matchPlayerId: id,
                matchIdFromParams,
                isMatchAdmin: !isMatchAdmin
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
                        variant={isMatchAdmin ? "default" : "outline"} 
                        size="icon"
                        className={isMatchAdmin ? "bg-purple-600 hover:bg-purple-700 h-10 w-10" : "h-10 w-10"}
                        onClick={handleToggleMatchAdmin}
                        disabled={isPending}
                    >
                        <ShieldCheck className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isMatchAdmin ? t('removeMatchAdmin') : t('addMatchAdmin')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};