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

interface HasPaidButtonProps {
    id: string;
    matchIdFromParams: string;
    hasPaid: boolean;
}

export const HasPaidButton = ({ 
    id, 
    matchIdFromParams,
    hasPaid, 
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
        <DropdownMenuItem 
            onClick={handleUpdatePaymentStatus}
            disabled={isPending}
        >
            {hasPaid ? t("markAsUnpaid") : t("markAsPaid")}
        </DropdownMenuItem>
    );
};