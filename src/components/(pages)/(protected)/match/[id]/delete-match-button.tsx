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
import { deleteMatch } from "@/actions/server_actions/mutations/match/deleteMatch";

// LUCIDE ICONS
import { Trash } from "lucide-react";

type DeleteMatchButtonProps = {
    matchIdFromParams: string;
}

export const DeleteMatchButton = ({
    matchIdFromParams
}: DeleteMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleDeleteMatch = () => {
        startTransition(async () => {
            const response = await deleteMatch({
                matchIdFromParams: matchIdFromParams
            })

            if (response.success) {
                toast.success(response.message)
                router.replace(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(response.message)
            }
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending} className="w-full sm:w-auto">
                    <Trash className="mr-2 h-4 w-4" /> {isPending ? t('deleting') : t('deleteMatch')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-500/80"
                        onClick={handleDeleteMatch} 
                        disabled={isPending}
                    >
                        {isPending ? t('deleting') : t('deleteMatch')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}