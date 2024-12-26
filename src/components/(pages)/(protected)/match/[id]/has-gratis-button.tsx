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
    matchIdFromParams: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasGratisButton = ({
    matchIdFromParams,
    currentUserMatchAdmin,
    player
}: HasGratisButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const isTemporaryPlayer = !!player.temporaryPlayer;
            const newGratisStatus = isTemporaryPlayer
                ? !player.temporaryPlayer?.has_gratis
                : !player.matchPlayer?.has_gratis;

            let newPaidStatus = isTemporaryPlayer
                ? player.temporaryPlayer?.has_paid || false
                : player.matchPlayer?.has_paid || false;
            let newDiscountStatus = isTemporaryPlayer
                ? player.temporaryPlayer?.has_discount || false
                : player.matchPlayer?.has_discount || false;

            if (newGratisStatus) {
                newPaidStatus = true;
                newDiscountStatus = false;
            }

           const result = await updatePaymentStatus({
                matchIdFromParams: matchIdFromParams,
                playerId: isTemporaryPlayer ? player.temporaryPlayer!.id : player.id,
                hasPaid: newPaidStatus,
                hasDiscount: newDiscountStatus,
                hasGratis: newGratisStatus,
                currentUserMatchAdmin: currentUserMatchAdmin,
                isTemporaryPlayer: isTemporaryPlayer
            });

            if (result.success) {
                toast.success(t('paymentStatusUpdated'));
            } else {
                toast.error(result.message);
            }
        });
    };

    const isGratis = player.temporaryPlayer
        ? player.temporaryPlayer.has_gratis
        : player.matchPlayer?.has_gratis;

    return (
        <PaymentStatusButton
            status="gratis"
            isActive={isGratis}
            onClick={handleUpdatePaymentStatus}
            icon={<Gift size={16} />}
            activeClass="bg-green-500 hover:bg-green-600 text-white"
            tooltipText={isGratis ? t('removeGratis') : t('markAsGratis')}
            disabled={isPending}
        />
    )
}