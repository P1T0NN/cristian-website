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
import { cancelTemporaryPlayerSubstitutionRequest } from "@/actions/server_actions/mutations/match/cancelTemporaryPlayerSubstitutionRequest";

// LUCIDE ICONS
import { Loader2 } from 'lucide-react';

type CancelTemporaryPlayerSubstitutionButtonProps = {
    matchIdFromParams: string;
    temporaryPlayerId: string;
}

export const CancelTemporaryPlayerSubstitutionButton = ({
    matchIdFromParams,
    temporaryPlayerId
}: CancelTemporaryPlayerSubstitutionButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleCancelSubstitution = () => {
        setIsDialogOpen(false);
        startTransition(async () => {
            const result = await cancelTemporaryPlayerSubstitutionRequest({
                matchIdFromParams: matchIdFromParams, 
                temporaryPlayerId: temporaryPlayerId
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
                    {isPending ? t('canceling') : t('cancelTemporaryPlayerSubstitution')}
                </Button>
            </DialogTrigger>
            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmCancelTemporaryPlayerSubstitutionTitle')}</DialogTitle>
                    <DialogDescription>{t('confirmCancelTemporaryPlayerSubstitutionDescription')}</DialogDescription>
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
