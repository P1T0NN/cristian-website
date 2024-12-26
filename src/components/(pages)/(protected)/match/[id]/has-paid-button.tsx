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
    matchIdFromParams: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasPaidButton = ({
    matchIdFromParams,
    currentUserMatchAdmin,
    player
}: HasPaidButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const isTemporaryPlayer = !!player.temporaryPlayer;
            const newPaidStatus = isTemporaryPlayer 
                ? !player.temporaryPlayer?.has_paid
                : !player.matchPlayer?.has_paid;
            
            const result = await updatePaymentStatus({
                matchIdFromParams: matchIdFromParams,
                playerId: isTemporaryPlayer ? player.temporaryPlayer!.id : player.id,
                hasPaid: newPaidStatus,
                hasDiscount: isTemporaryPlayer ? player.temporaryPlayer?.has_discount || false : player.matchPlayer?.has_discount || false,
                hasGratis: isTemporaryPlayer ? player.temporaryPlayer?.has_gratis || false : player.matchPlayer?.has_gratis || false,
                currentUserMatchAdmin: currentUserMatchAdmin,
                isTemporaryPlayer: isTemporaryPlayer
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    const isPaid = player.temporaryPlayer ? player.temporaryPlayer.has_paid : player.matchPlayer?.has_paid;

    return (
        <PaymentStatusButton
            status="paid"
            isActive={isPaid}
            onClick={handleUpdatePaymentStatus}
            icon={<DollarSign size={16} />}
            activeClass="bg-green-500 hover:bg-green-600 text-white"
            tooltipText={isPaid ? t('markAsUnpaid') : t('markAsPaid')}
            disabled={isPending}
        />
    )
}