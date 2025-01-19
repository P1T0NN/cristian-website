"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// SERVER ACTIONS
import { removePlayer } from "../../actions/server_actions/removePlayer";

// LUCIDE ICONS
import { User, UserX } from "lucide-react";

type PlayerActionsDialogProps = {
    matchPlayerId: string;
    playerId: string;
    playerType: "regular" | "temporary";
    isAdmin: boolean;
    matchIdFromParams: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const PlayerActionsDialog = ({
    matchPlayerId,
    playerId,
    playerType,
    isAdmin,
    matchIdFromParams,
    isOpen,
    setIsOpen
}: PlayerActionsDialogProps) => {
    const t = useTranslations('MatchPage');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);

    const handleGoToProfile = () => {
        if (playerType === "regular") {
            router.push(`${PROTECTED_PAGE_ENDPOINTS.PLAYER_PAGE}/${playerId}`);
        }
        setIsOpen(false);
    };

    const handleRemovePlayer = () => {
        startTransition(async () => {
            const response = await removePlayer({
                matchIdFromParams,
                playerId: matchPlayerId,
                playerType,
                isAdmin
            });

            if (response.success) {
                toast.success(response.message);
                setIsOpen(false);
            } else {
                toast.error(response.message);
            }
        });
    };

    // If showing confirmation dialog
    if (showConfirmRemove) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('confirmRemoveTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('confirmRemoveDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmRemove(false)}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemovePlayer}
                            disabled={isPending}
                        >
                            {isPending ? t('removing') : t('remove')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Main actions dialog
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('playerActions')}</DialogTitle>
                    <DialogDescription>
                        {t('playerActionsDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    {playerType === "regular" && (
                        <Button
                            onClick={handleGoToProfile}
                            className="w-full"
                            variant="outline"
                        >
                            <User className="mr-2 h-4 w-4" />
                            {t('goToProfile')}
                        </Button>
                    )}
                    <Button
                        onClick={() => setShowConfirmRemove(true)}
                        className="w-full"
                        variant="destructive"
                    >
                        <UserX className="mr-2 h-4 w-4" />
                        {t('removePlayer')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};