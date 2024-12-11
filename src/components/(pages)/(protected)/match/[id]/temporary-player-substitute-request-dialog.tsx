"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// SERVER ACTIONS
import { requestTemporaryPlayerSubstitute } from "@/actions/server_actions/mutations/match/requestTemporaryPlayerSubstitute";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type TemporaryPlayerSubstituteRequestDialogProps = {
    matchId: string;
    authToken: string;
    temporaryPlayerId: string;
    setShowSubstituteDialog: (isVisible: boolean) => void;
}

export const TemporaryPlayerSubstituteRequestDialog = ({
    matchId,
    authToken,
    temporaryPlayerId,
    setShowSubstituteDialog
}: TemporaryPlayerSubstituteRequestDialogProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleRequestSubstitute = () => {
        startTransition(async () => {
            const response = await requestTemporaryPlayerSubstitute(
                authToken,
                matchId,
                temporaryPlayerId
            );

            if (response.success) {
                toast.success(response.message);
                setShowSubstituteDialog(false);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={setShowSubstituteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('substituteRequestTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('substituteRequestDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestSubstitute} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('requestingSubstitute')}
                            </>
                        ) : (
                            t('requestSubstitute')
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};