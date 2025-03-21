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
import { updatePlayerPaymentStatus } from "../../actions/server_actions/updatePlayerPaymentStatus";

// LUCIDE ICONS
import { Gift } from "lucide-react";

interface HasGratisButtonProps {
    id: string;
    matchIdFromParams: string;
    hasGratis: boolean;
}

export const HasGratisButton = ({ 
    id, 
    matchIdFromParams,
    hasGratis
}: HasGratisButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const response = await updatePlayerPaymentStatus({
                matchIdFromParams: matchIdFromParams,
                matchPlayerId: id,
                type: 'gratis',
                currentValue: hasGratis
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
                        variant={hasGratis ? "default" : "outline"} 
                        size="icon"
                        className={hasGratis ? "bg-blue-600 hover:bg-blue-700 h-10 w-10" : "h-10 w-10"}
                        onClick={handleUpdatePaymentStatus}
                        disabled={isPending}
                    >
                        <Gift className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{hasGratis ? t("removeGratis") : t("markAsGratis")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};