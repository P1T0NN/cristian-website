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
import { Percent} from "lucide-react";

type HasDiscountButtonProps = {
    matchIdFromParams: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasDiscountButton = ({
    matchIdFromParams,
    currentUserMatchAdmin,
    player
}: HasDiscountButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const isTemporaryPlayer = !!player.temporaryPlayer;
            const newDiscountStatus = isTemporaryPlayer
                ? !player.temporaryPlayer?.has_discount
                : !player.matchPlayer?.has_discount;
            const newPaidStatus = isTemporaryPlayer
                ? player.temporaryPlayer?.has_paid || false
                : player.matchPlayer?.has_paid || false;
            let newGratisStatus = isTemporaryPlayer
                ? player.temporaryPlayer?.has_gratis || false
                : player.matchPlayer?.has_gratis || false;

            if (newDiscountStatus) {
                newGratisStatus = false;
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

    const isDiscount = player.temporaryPlayer
        ? player.temporaryPlayer.has_discount
        : player.matchPlayer?.has_discount;

    const isGratis = player.temporaryPlayer
        ? player.temporaryPlayer.has_gratis
        : player.matchPlayer?.has_gratis;

    return (
        <PaymentStatusButton
            status="discount"
            isActive={isDiscount}
            onClick={handleUpdatePaymentStatus}
            icon={<Percent size={16} />}
            activeClass="bg-yellow-500 hover:bg-yellow-600 text-white"
            tooltipText={isDiscount ? t('removeDiscount') : t('applyDiscount')}
            disabled={isPending || isGratis}
        />
    )
}