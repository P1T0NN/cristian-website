"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
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

// SERVER ACTIONS
import { replacePlayer } from "../../actions/server_actions/replacePlayer";

type PlayerReplaceButtonProps = {
    matchIdFromParams: string;
    matchPlayerId: string;
    teamNumber: 0 | 1 | 2;
}

export const PlayerReplaceButton = ({
    matchIdFromParams,
    matchPlayerId,
    teamNumber
}: PlayerReplaceButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleReplacePlayer = (withBalance: boolean) => {
        startTransition(async () => {
            const response = await replacePlayer({
                matchIdFromParams: matchIdFromParams,
                matchPlayerId: matchPlayerId,
                teamNumber: teamNumber,
                withBalance: withBalance
            });

            if (response.success) {
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
            setIsDialogOpen(false);
        });
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                    className="text-white bg-yellow-500 hover:bg-yellow-500/80 w-full sm:w-auto"
                >
                    {t('replace')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmReplace')}</DialogTitle>
                    <DialogDescription>
                        {t('replaceConfirmationMessage')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <Button 
                            onClick={() => handleReplacePlayer(false)} 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? t('replacing') : t('replaceAndPayWithCash')}
                        </Button>
                        <Button 
                            onClick={() => handleReplacePlayer(true)} 
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? t('replacing') : t('replaceAndPayWithBalance')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}