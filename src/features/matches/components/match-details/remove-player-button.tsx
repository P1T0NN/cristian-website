"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";

// SERVER ACTIONS
import { removePlayer } from "../../actions/server_actions/removePlayer";

// TYPES
import type { typesPlayer } from "@/features/players/types/typesPlayer";

// LUCIDE ICONS
import { X, Loader2 } from "lucide-react";

type RemovePlayerButtonProps = {
    matchIdFromParams: string;
    player: typesPlayer;
    setShowSubstituteDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RemovePlayerButton = ({
    matchIdFromParams,
    player,
    setShowSubstituteDialog
}: RemovePlayerButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRemovePlayer = () => {
        startTransition(async () => {
            const response = await removePlayer({
                matchIdFromParams,
                playerId: player.id,
                playerType: player.type
            });

            if (response.success) {
                toast.success(response.message);
            } else if (response.metadata && response.metadata.canRequestSubstitute) {
                setShowSubstituteDialog(true);
            } else {
                toast.error(response.message);
            }

            setIsDialogOpen(false);
        });
    };

    const tooltipText = player.type === 'temporary' ? 
        t('removeTemporaryPlayer') : 
        t('removePlayer');

    const dialogTitle = player.type === 'temporary' ? 
        t('confirmRemoveFriendTitle') : 
        t('confirmRemovePlayerTitle');

    const dialogDescription = player.type === 'temporary' ? 
        t('confirmRemoveFriendDescription') : 
        t('confirmRemovePlayerDescription');

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X size={14} />
                                )}
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {t('cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleRemovePlayer} disabled={isPending}>
                        {isPending ? t('removing') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};