"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
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
import { cancelSubstitutionRequest } from "@/actions/server_actions/mutations/match/cancelSubstitutionRequest";

// LUCIDE ICONS
import { Loader2 } from 'lucide-react';

type CancelSubstitutionButtonProps = {
    matchIdFromParams: string;
}

export const CancelSubstitutionButton = ({
    matchIdFromParams
}: CancelSubstitutionButtonProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCancelSubstitution = () => {
        setIsDialogOpen(false);

        startTransition(async () => {
            const result = await cancelSubstitutionRequest({
                matchIdFromParams: matchIdFromParams
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className="w-full sm:w-auto"
                >
                    {isPending ? t('canceling') : t('cancelSubstitution')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmCancelSubstitutionTitle')}</DialogTitle>
                    <DialogDescription>{t('confirmCancelSubstitutionDescription')}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('cancel')}</Button>
                    <Button 
                        variant="secondary" 
                        className="text-secondary bg-red-500 hover:bg-red-500/80"
                        onClick={handleCancelSubstitution} 
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('canceling')}
                            </>
                        ) : (
                            t('confirm')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};