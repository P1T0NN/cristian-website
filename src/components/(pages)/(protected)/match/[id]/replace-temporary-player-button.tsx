"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// SERVER ACTIONS
import { replaceTemporaryPlayer } from "@/actions/server_actions/mutations/match/replaceTemporaryPlayers";

// TYPES
import type { typesUser } from "@/types/typesUser";

// LUCIDE ICONS
import { Loader2 } from 'lucide-react';

type ReplaceTemporaryPlayerButtonProps = {
    player: typesUser;
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
}

export const ReplaceTemporaryPlayerButton = ({
    player,
    matchIdFromParams,
    teamNumber
}: ReplaceTemporaryPlayerButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleReplacePlayer = () => {
        startTransition(async () => {
            const response = await replaceTemporaryPlayer({
                matchIdFromParams: matchIdFromParams,
                temporaryPlayerId: player.temporaryPlayer?.id as string,
                teamNumber: teamNumber
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
                        {t('replaceTemporaryPlayerConfirmationMessage')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleReplacePlayer}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('replacing')}
                            </>
                        ) : (
                            t('confirmReplace')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

