"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteMatch } from "../../actions/server_actions/deleteMatch";

// LUCIDE ICONS
import { Trash2 } from "lucide-react";

interface DeleteMatchButtonProps {
    matchIdFromParams: string;
}

export const DeleteMatchButton = ({
    matchIdFromParams
}: DeleteMatchButtonProps) => {
    const t = useTranslations('MatchPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleDeleteMatch = () => {
        startTransition(async () => {
            const result = await deleteMatch({
                matchIdFromParams
            });

            if (result.success) {
                toast.success(result.message);
                router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="destructive"
                    size="sm"
                    className="inline-flex items-center"
                    disabled={isPending}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isPending ? t('deletingMatch') : t('deleteMatch')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteMatchDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteMatch}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? t('deletingMatch') : t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
