"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { PaymentStatusButton } from "./payment-status-button";
import { toast } from "sonner";

// SERVER ACTIONS
import { updatePaymentStatus } from "@/actions/server_actions/mutations/match/updatePaymentStatus";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { DollarSign } from "lucide-react";

type HasPaidButtonProps = {
    authToken: string;
    matchId: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasPaidButton = ({
    authToken,
    matchId,
    currentUserMatchAdmin,
    player
}: HasPaidButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const newPaidStatus = !player.matchPlayer?.has_paid;
            
            const result = await updatePaymentStatus(
                authToken,
                matchId,
                player.id,
                newPaidStatus,
                player.matchPlayer?.has_discount || false,
                player.matchPlayer?.has_gratis || false,
                currentUserMatchAdmin
            );

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <PaymentStatusButton
            status="paid"
            isActive={player.matchPlayer?.has_paid}
            onClick={handleUpdatePaymentStatus}
            icon={<DollarSign size={16} />}
            activeClass="bg-blue-500 hover:bg-blue-600 text-white"
            tooltipText={player.matchPlayer?.has_paid ? t('markAsUnpaid') : t('markAsPaid')}
            disabled={isPending}
        />
    )
}