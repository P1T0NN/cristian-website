"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteMatchFromHistory } from "@/actions/server_actions/mutations/match/deleteMatchFromHistory";

// TYPES
import type { typesMatchHistory } from "@/types/typesMatchHistory";

// LUCIDE IOCNS
import { Trash2 } from "lucide-react";

type DeleteMatchFromHistoryDialogProps = {
    match: typesMatchHistory;
}

export const DeleteMatchFromHistoryDialog = ({
    match,
}: DeleteMatchFromHistoryDialogProps) => {
    const t = useTranslations('MatchHistoryPage');
    const [isPending, startTransition] = useTransition();

    const handleDeleteMatch = () => {
        startTransition(async () => {
            const response = await deleteMatchFromHistory({
                matchId: match.id
            })

            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isPending ? t('deleting') : t('delete')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteConfirmDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteMatch} disabled={isPending}>
                        {isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}