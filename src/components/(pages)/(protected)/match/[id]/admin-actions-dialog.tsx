"use client"

// REACTJS IMPORTS
import { useTransition } from 'react';

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

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
    matchIdFromParams: string;
    isOpen: boolean;
    onClose: () => void;
    player: {
        id: string;
        fullName: string;
    };
    isTemporaryPlayer?: boolean;
}

export const AdminActionsDialog = ({ 
    matchIdFromParams, 
    isOpen, 
    onClose, 
    player,
    isTemporaryPlayer = false
}: PlayerActionModalProps) => {
    const t = useTranslations("MatchPage");

    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleGoToProfile = () => {
        if (!isTemporaryPlayer) {
            router.push(`${PROTECTED_PAGE_ENDPOINTS.PLAYER_PAGE}/${player.id}`);
        }
    };

    const handleRemovePlayer = async () => {
        startTransition(async () => {
            const result = await adminRemovePlayerFromMatch({
                matchIdFromParams: matchIdFromParams, 
                playerId: player.id, 
                isTemporaryPlayer: isTemporaryPlayer
            });

            if (result.success) {
                toast.success(isTemporaryPlayer ? t('temporaryPlayerRemoved') : t('playerRemoved'));
                
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
                    <DialogTitle>{isTemporaryPlayer ? t('temporaryPlayerActions') : t('playerActions')}</DialogTitle>
                    <DialogDescription>
                        {isTemporaryPlayer 
                            ? t('temporaryPlayerActionsDescription', { playerName: player.fullName })
                            : t('playerActionsDescription', { playerName: player.fullName })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    {!isTemporaryPlayer && (
                        <Button onClick={handleGoToProfile}>{t('goToProfile')}</Button>
                    )}
                    <Button variant="destructive" onClick={handleRemovePlayer} disabled={isPending}>
                        {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('removing')}
                        </>
                        ) : (
                            isTemporaryPlayer ? t('removeTemporaryPlayer') : t('removePlayer')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}