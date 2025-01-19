"use client"

// REACTJS IMPORTS
import { useTransition } from "react";
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

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
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteMatch } from "../../actions/server_actions/deleteMatch";

// TYPES
import type { typesMatch } from "../../types/typesMatch";

// LUCIDE ICONS
import { Trash2 } from "lucide-react";

type DeleteMatchFromHistoryDialogProps = {
    match: typesMatch;
}

export const DeleteMatchFromHistoryDialog = ({
    match,
}: DeleteMatchFromHistoryDialogProps) => {
    const t = useTranslations('MatchHistoryPage');
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDeleteMatch = () => {
        startTransition(async () => {
            const response = await deleteMatch({
                matchIdFromParams: match.id
            });

            if (response.success) {
                toast.success(response.message);
                router.replace(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(response.message);
            }
        });
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
                    <AlertDialogAction 
                        onClick={handleDeleteMatch} 
                        disabled={isPending}
                    >
                        {isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};