"use client"

// REACTJS IMPORTS
import { useTransition } from 'react';

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { ADMIN_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { adminRemovePlayerFromMatch } from '@/actions/server_actions/mutations/match/adminRemovePlayerFromTeam';
import { updatePaymentStatus } from '@/actions/server_actions/mutations/match/updatePaymentStatus';

// LUCIDE ICONS
import { Loader2 } from 'lucide-react';

type PlayerActionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: string;
        fullName: string;
        matchPlayer?: {
            has_paid: boolean;
            has_discount: boolean;
            has_gratis: boolean;
        };
    };
    matchId: string;
    authToken: string;
}

export const AdminActionsDialog = ({ 
    isOpen, 
    onClose, 
    player, 
    matchId, 
    authToken 
}: PlayerActionModalProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleGoToProfile = () => {
        router.push(`${ADMIN_PAGE_ENDPOINTS.PLAYER_PAGE}/${player.id}`);
    };

    const handleUpdatePaymentStatus = (status: 'paid' | 'discount' | 'gratis') => {
        startTransition(async () => {
            let hasPaid = status === 'paid' ? !player.matchPlayer?.has_paid : player.matchPlayer?.has_paid;
            let hasDiscount = status === 'discount' ? !player.matchPlayer?.has_discount : player.matchPlayer?.has_discount;
            let hasGratis = status === 'gratis' ? !player.matchPlayer?.has_gratis : player.matchPlayer?.has_gratis;

            // Ensure mutual exclusivity and correct implications
            if (status === 'gratis' && hasGratis) {
                hasPaid = true;
                hasDiscount = false;
            } else if (status === 'discount' && hasDiscount) {
                hasGratis = false;
            }

            const result = await updatePaymentStatus(
                authToken,
                matchId,
                player.id,
                hasPaid || false,
                hasDiscount || false,
                hasGratis || false
            );

            if (result.success) {
                toast.success(t('paymentStatusUpdated'));
                onClose();
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleRemovePlayer = () => {
        startTransition(async () => {
            const result = await adminRemovePlayerFromMatch(authToken, matchId, player.id);

            if (result.success) {
                toast.success(t('playerRemoved'));
                onClose();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('playerActions')}</DialogTitle>
                    <DialogDescription>{t('playerActionsDescription', { playerName: player.fullName })}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button 
                        onClick={() => handleUpdatePaymentStatus('paid')}
                        variant={player.matchPlayer?.has_paid ? "default" : "outline"}
                        className={player.matchPlayer?.has_paid ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                    >
                        {player.matchPlayer?.has_paid ? t('markAsUnpaid') : t('markAsPaid')}
                    </Button>
                    <Button 
                        onClick={() => handleUpdatePaymentStatus('discount')}
                        variant={player.matchPlayer?.has_discount ? "default" : "outline"}
                        disabled={player.matchPlayer?.has_gratis}
                        className={player.matchPlayer?.has_discount ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                    >
                        {player.matchPlayer?.has_discount ? t('removeDiscount') : t('applyDiscount')}
                    </Button>
                    <Button 
                        onClick={() => handleUpdatePaymentStatus('gratis')}
                        variant={player.matchPlayer?.has_gratis ? "default" : "outline"}
                        className={player.matchPlayer?.has_gratis ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                    >
                        {player.matchPlayer?.has_gratis ? t('removeGratis') : t('markAsGratis')}
                    </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                    <Button onClick={handleGoToProfile}>{t('goToProfile')}</Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleRemovePlayer} 
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('removing')}
                            </>
                        ) : (
                            t('removePlayer')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}