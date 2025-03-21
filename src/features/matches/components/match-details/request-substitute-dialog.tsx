"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";

// ACTIONS
import { requestSubstitute } from "../../actions/server_actions/requestSubstitute";

interface RequestSubstituteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    matchIdFromParams: string;
    playerType?: 'regular' | 'temporary';
}

export const RequestSubstituteDialog = ({
    isOpen,
    onClose,
    matchIdFromParams,
    playerType = 'regular'
}: RequestSubstituteDialogProps) => {
    const t = useTranslations('MatchPage');
    
    const [isPending, startTransition] = useTransition();

    const handleRequestSubstitute = () => {
        startTransition(async () => {
            const result = await requestSubstitute({
                matchIdFromParams,
                playerType
            });

            if (result.success) {
                toast.success(result.message);
                onClose();
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('tooLateToLeaveTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('tooLateToLeaveDescription')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleRequestSubstitute}
                        disabled={isPending}
                    >
                        {isPending ? t('requestingSubstitute') : t('requestSubstitute')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
