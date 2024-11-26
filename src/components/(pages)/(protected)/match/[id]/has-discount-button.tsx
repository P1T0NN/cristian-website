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
    authToken: string;
    matchId: string;
    currentUserMatchAdmin: boolean;
    player: typesUser;
}

export const HasDiscountButton = ({
    authToken,
    matchId,
    currentUserMatchAdmin,
    player
}: HasDiscountButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleUpdatePaymentStatus = () => {
        startTransition(async () => {
            const newDiscountStatus = !player.matchPlayer?.has_discount;
            const newPaidStatus = player.matchPlayer?.has_paid || false;
            let newGratisStatus = player.matchPlayer?.has_gratis || false;

            if (newDiscountStatus) {
                newGratisStatus = false;
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
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <PaymentStatusButton
            status="discount"
            isActive={player.matchPlayer?.has_discount}
            onClick={handleUpdatePaymentStatus}
            icon={<Percent size={16} />}
            activeClass="bg-yellow-500 hover:bg-yellow-600 text-white"
            tooltipText={player.matchPlayer?.has_discount ? t('removeDiscount') : t('applyDiscount')}
            disabled={isPending || player.matchPlayer?.has_gratis}
        />
    )
}