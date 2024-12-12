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
import { requestSubstitute } from "@/actions/server_actions/mutations/match/requestSubstitute";
import { requestTemporaryPlayerSubstitute } from "@/actions/server_actions/mutations/match/requestTemporaryPlayerSubstitute";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type SubstituteRequestDialogProps = {
    matchId: string;
    authToken: string;
    setShowSubstituteDialog: (isVisible: boolean) => void;
    isForTemporaryPlayer?: boolean;
    temporaryPlayerId?: string;
}

export const SubstituteRequestDialog = ({
    matchId,
    authToken,
    setShowSubstituteDialog,
    isForTemporaryPlayer = false,
    temporaryPlayerId
}: SubstituteRequestDialogProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleRequestSubstitute = () => {
        startTransition(async () => {
            let response;

            if (isForTemporaryPlayer) {
                if (!temporaryPlayerId) {
                    toast.error(t('temporaryPlayerIdMissing'));
                    return;
                }
                response = await requestTemporaryPlayerSubstitute(
                    authToken,
                    matchId,
                    temporaryPlayerId
                );
            } else {
                response = await requestSubstitute(
                    authToken,
                    matchId
                );
            }

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