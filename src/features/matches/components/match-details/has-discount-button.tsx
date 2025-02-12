"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// COMPONENTS
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";

// SERVER ACTIONS
import { updatePlayerPaymentStatus } from "../../actions/server_actions/updatePlayerPaymentStatus";

interface HasDiscountButtonProps {
    id: string;
    matchIdFromParams: string;
    hasDiscount: boolean;
}

export const HasDiscountButton = ({ 
    id, 
    matchIdFromParams,
    hasDiscount, 
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
        <DropdownMenuItem 
            onClick={handleUpdatePaymentStatus}
            disabled={isPending}
        >
            {hasDiscount ? t("removeDiscount") : t("addDiscount")}
        </DropdownMenuItem>
    );
};