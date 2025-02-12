"use client"

// REACTJS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

// LUCIDE ICONS
import { UserPlus2 } from "lucide-react";

// SERVER ACTIONS
import { replacePlayer } from "../../actions/server_actions/replacePlayer";

interface ReplacePlayerButtonProps {
    matchIdFromParams: string;
    playerToReplaceId: string;
}

export const ReplacePlayerButton = ({
    matchIdFromParams,
    playerToReplaceId,
}: ReplacePlayerButtonProps) => {
    const t = useTranslations('MatchPage');
    
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const handleReplacePlayer = (withBalance: boolean) => {
        startTransition(async () => {
            const result = await replacePlayer({
                matchIdFromParams,
                playerToReplaceId,
                withBalance,
            });

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="secondary"
                    size="sm"
                >
                    <UserPlus2 className="h-4 w-4 mr-2" />
                    {t('replacePlayer')}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('replacePlayerTitle')}</DialogTitle>
                    <DialogDescription className="space-y-3">
                        {t('replacePlayerDescription')}
                    </DialogDescription>
                    <DialogDescription 
                        className="font-medium text-yellow-600 dark:text-yellow-500"
                    >
                        {t('replacePlayerWarning')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handleReplacePlayer(false)}
                        disabled={isPending}
                    >
                        {t('joinWithCash')}
                    </Button>
                    <Button
                        onClick={() => handleReplacePlayer(true)}
                        disabled={isPending}
                    >
                        {t('joinWithBalance')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};