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
} from "@/shared/components/ui/alert-dialog";

// SERVER ACTIONS
import { requestSubstitute } from "../../actions/server_actions/requestSubstitute";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type SubstituteRequestDialogProps = {
    matchIdFromParams: string;
    setShowSubstituteDialog: (isVisible: boolean) => void;
    matchPlayerId: string;
    playerType: 'temporary' | 'regular';
}

export const SubstituteRequestDialog = ({
    matchIdFromParams,
    setShowSubstituteDialog,
    matchPlayerId,
    playerType
}: SubstituteRequestDialogProps) => {
    const t = useTranslations("MatchPage");
    const [isPending, startTransition] = useTransition();

    const handleRequestSubstitute = () => {
        startTransition(async () => {
            const response = await requestSubstitute({
                matchIdFromParams,
                matchPlayerId,
                playerType
            });

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
                    <AlertDialogTitle>
                        {t(playerType === 'temporary' ? 
                            'temporarySubstituteRequestTitle' : 
                            'substituteRequestTitle'
                        )}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t(playerType === 'temporary' ? 
                            'temporarySubstituteRequestDescription' : 
                            'substituteRequestDescription'
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleRequestSubstitute} 
                        disabled={isPending}
                    >
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