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
import { Percent } from "lucide-react";

interface HasDiscountButtonProps {
    id: string;
    matchIdFromParams: string;
    hasDiscount: boolean;
}

export const HasDiscountButton = ({ 
    id, 
    matchIdFromParams,
    hasDiscount
}: HasDiscountButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const response = await updatePlayerPaymentStatus({
                matchIdFromParams: matchIdFromParams,
                matchPlayerId: id,
                type: 'discount',
                currentValue: hasDiscount
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
                        variant={hasDiscount ? "default" : "outline"} 
                        size="icon"
                        className={hasDiscount ? "bg-yellow-600 hover:bg-yellow-700 h-10 w-10" : "h-10 w-10"}
                        onClick={handleUpdatePaymentStatus}
                        disabled={isPending}
                    >
                        <Percent className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{hasDiscount ? t("removeDiscount") : t("addDiscount")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};