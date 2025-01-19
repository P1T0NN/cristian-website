"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
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
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

// SERVER ACTIONS
import { leaveMatch } from "../../actions/server_actions/leaveTeam";

// LUCIDE ICONS
import { Loader2 } from "lucide-react";

type PlayerLeaveTeamButtonProps = {
    matchIdFromParams: string;
    setShowSubstituteDialog: (isVisible: boolean) => void;
    matchPlayerId: string;
    playerType: "regular" | "temporary";
}

export const PlayerLeaveTeamButton = ({
    matchIdFromParams,
    setShowSubstituteDialog,
    matchPlayerId,
    playerType
}: PlayerLeaveTeamButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();

    const handleLeaveTeam = () => {
        startTransition(async () => {
            const response = await leaveMatch({
                matchIdFromParams,
                matchPlayerId,
                playerType
            });

            if (response.success) {
                toast.success(response.message);
            } else {
                // Check if it's too late to leave but can request substitute
                if (response.metadata?.code === 'TOO_LATE_TO_LEAVE' && 
                    response.metadata?.metadata?.canRequestSubstitute) {
                    setShowSubstituteDialog(true);
                } else {
                    toast.error(response.message);
                }
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    className="w-full sm:w-auto"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('leaving')}
                        </>
                    ) : (
                        t('leaveTeam')
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmLeaveMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('confirmLeaveMatchDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleLeaveTeam}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('leaving')}
                            </>
                        ) : (
                            t('confirm')
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};