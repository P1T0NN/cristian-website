"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// SERVER ACTIONS
import { removeFriend } from "@/actions/server_actions/mutations/match/removeFriend";

// LUCIDE ICONS
import { X, Loader2 } from "lucide-react";

type RemoveFriendButtonProps = {
    matchIdFromParams: string;
    temporaryPlayerId: string;
    setShowSubstituteDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RemoveFriendButton = ({
    matchIdFromParams,
    temporaryPlayerId,
    setShowSubstituteDialog
}: RemoveFriendButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRemoveTemporaryPlayer = () => {
        startTransition(async () => {
            const response = await removeFriend({
                matchIdFromParams: matchIdFromParams, 
                temporaryPlayerId: temporaryPlayerId
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
                        <p>{t('removeTemporaryPlayer')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmRemoveFriendTitle')}</DialogTitle>
                    <DialogDescription>{t('confirmRemoveFriendDescription')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleRemoveTemporaryPlayer} disabled={isPending}>
                        {isPending ? t('removing') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};