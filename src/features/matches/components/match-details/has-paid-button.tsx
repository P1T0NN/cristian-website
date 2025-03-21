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
import { DollarSign } from "lucide-react";

interface HasPaidButtonProps {
    id: string;
    matchIdFromParams: string;
    hasPaid: boolean;
}

export const HasPaidButton = ({ 
    id, 
    matchIdFromParams,
    hasPaid
}: HasPaidButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const response = await updatePlayerPaymentStatus({
                matchIdFromParams: matchIdFromParams,
                matchPlayerId: id,
                type: 'paid',
                currentValue: hasPaid
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
                        variant={hasPaid ? "default" : "outline"} 
                        size="icon"
                        className={hasPaid ? "bg-green-600 hover:bg-green-700 h-10 w-10" : "h-10 w-10"}
                        onClick={handleUpdatePaymentStatus}
                        disabled={isPending}
                    >
                        <DollarSign className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{hasPaid ? t("markAsUnpaid") : t("markAsPaid")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};