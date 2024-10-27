"use client"

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { 
    AlertDialog, 
    AlertDialogTrigger, 
    AlertDialogContent, 
    AlertDialogHeader,
    AlertDialogTitle, 
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogFooter, 
    AlertDialogCancel 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteMatchButtonProps = {
    handleDeleteMatch: () => Promise<void>;
}

export const DeleteMatchButton = ({
    handleDeleteMatch
}: DeleteMatchButtonProps) => {
    const t = useTranslations("MatchCardComponent");

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    className="bg-red-500 hover:bg-red-500/80 w-full"
                >
                    {t('deleteMatch')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteMatchConfirmation')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteMatch}
                        className="bg-red-500 hover:bg-red-500/80"
                    >
                        {t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}