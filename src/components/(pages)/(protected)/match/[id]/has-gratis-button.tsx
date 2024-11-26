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
import { Gift } from "lucide-react";

type HasGratisButtonProps = {
    authToken: string;
    matchId: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasGratisButton = ({
    authToken,
    matchId,
    currentUserMatchAdmin,
    player
}: HasGratisButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const newGratisStatus = !player.matchPlayer?.has_gratis;
            let newPaidStatus = player.matchPlayer?.has_paid || false;
            let newDiscountStatus = player.matchPlayer?.has_discount || false;

            if (newGratisStatus) {
                newPaidStatus = true;
                newDiscountStatus = false;
            }

            const result = await updatePaymentStatus(
                authToken,
                matchId,
                player.id,
                newPaidStatus,
                newDiscountStatus,
                newGratisStatus,
                currentUserMatchAdmin
            );

            if (result.success) {
                toast.success(t('paymentStatusUpdated'));
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <PaymentStatusButton
            status="gratis"
            isActive={player.matchPlayer?.has_gratis}
            onClick={handleUpdatePaymentStatus}
            icon={<Gift size={16} />}
            activeClass="bg-green-500 hover:bg-green-600 text-white"
            tooltipText={player.matchPlayer?.has_gratis ? t('removeGratis') : t('markAsGratis')}
            disabled={isPending}
        />
    )
}