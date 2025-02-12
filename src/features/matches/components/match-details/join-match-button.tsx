"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { joinMatch } from "@/features/matches/actions/server_actions/joinMatch";

interface JoinMatchButtonProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const JoinMatchButton = ({
    matchIdFromParams,
    teamNumber
}: JoinMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);

    const handleJoinTeam = (withBalance: boolean) => {
        startTransition(async () => {
            const response = await joinMatch({
                matchIdFromParams,
                teamNumber,
                withBalance,
            });

            if (response.success && response.data) {
                setOpen(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                >
                    {t("joinTeam")}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("joinTeamConfirmationTitle")}</DialogTitle>
                    
                    <DialogDescription className="space-y-3">{t("joinTeamConfirmationDescription")}</DialogDescription>

                    <DialogDescription 
                        className="font-medium text-yellow-600 dark:text-yellow-500"
                    >
                        {t("joinTeamConfirmationWarning")}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleJoinTeam(false)}
                        disabled={isPending}
                    >
                        {t("joinWithCash")}
                    </Button>

                    <Button
                        onClick={() => handleJoinTeam(true)}
                        disabled={isPending}
                    >
                        {t("joinWithBalance")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
