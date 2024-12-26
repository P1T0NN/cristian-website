"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { joinMatch } from "@/actions/server_actions/mutations/match/joinMatch";

type JoinTeamButtonProps = {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
}

export const JoinTeamButton = ({
    matchIdFromParams,
    teamNumber,
}: JoinTeamButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleJoinTeam = (withBalance: boolean) => {
        startTransition(async () => {
            const response = await joinMatch({
                matchIdFromParams: matchIdFromParams,
                teamNumber: teamNumber,
                withBalance: withBalance
            })

            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
            
            setIsDialogOpen(false);
        })
    };

    const buttonText = teamNumber === 0 ? t('joinMatch') : t('joinTeam', { teamNumber });

    const dialogTitle = teamNumber === 0 
        ? t('joinMatchConfirmTitle')
        : t('joinTeamConfirmTitle', { teamNumber });

    const dialogDescription = teamNumber === 0
        ? t.rich('joinMatchConfirmDescription', {
            hours: (chunks) => <span className="font-bold text-blue-500">{chunks}</span>,
            substitute: (chunks) => <span className="font-semibold text-yellow-500">{chunks}</span>
          })
        : t.rich('joinTeamConfirmDescription', {
            hours: (chunks) => <span className="font-bold text-blue-500">{chunks}</span>,
            substitute: (chunks) => <span className="font-semibold text-yellow-500">{chunks}</span>,
            teamNumber
          });

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button disabled={isPending}>
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <Button 
                            onClick={() => handleJoinTeam(false)} 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? t('joiningMatch') : t('joinAndPayWithCash')}
                        </Button>
                        <Button 
                            onClick={() => handleJoinTeam(true)} 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? t('joiningMatch') : t('joinAndPayWithBalance')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}