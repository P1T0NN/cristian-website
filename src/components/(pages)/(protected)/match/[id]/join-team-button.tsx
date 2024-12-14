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
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { joinMatch } from "@/actions/server_actions/mutations/match/joinMatch";

type JoinTeamButtonProps = {
    teamNumber: 0 | 1 | 2;
    matchId: string;
    currentUserId: string;
    authToken: string;
}

export const JoinTeamButton = ({
    teamNumber,
    matchId,
    authToken
}: JoinTeamButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const handleJoinTeam = () => {
        startTransition(async () => {
            const response = await joinMatch(
                authToken,
                matchId,
                teamNumber
            )

            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
        })
    };

    const buttonText = isPending 
        ? (teamNumber === 0 ? t('joiningMatch') : t('joiningTeam'))
        : (teamNumber === 0 ? t('joinMatch') : t('joinTeam', { teamNumber }));

    const dialogTitle = teamNumber === 0 
        ? t('joinMatchConfirmTitle')
        : t('joinTeamConfirmTitle', { teamNumber });

    const dialogDescription = teamNumber === 0
        ? t('joinMatchConfirmDescription')
        : t('joinTeamConfirmDescription', { teamNumber });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    disabled={isPending}
                >
                    {buttonText}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dialogDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleJoinTeam} disabled={isPending}>
                        {isPending ? t('joiningMatch') : t('confirmJoin')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}