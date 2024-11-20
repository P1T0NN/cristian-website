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

// LUCIDE ICONS
import { Loader2 } from 'lucide-react';

type PlayerActionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: string;
        fullName: string;
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

    const handleRemovePlayer = async () => {
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
                <DialogFooter className="sm:justify-start">
                    <Button onClick={handleGoToProfile}>{t('goToProfile')}</Button>
                    <Button variant="destructive" onClick={handleRemovePlayer} disabled={isPending}>
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