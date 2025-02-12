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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "sonner";

// LUCIDE ICONS
import { LockIcon } from "lucide-react";

// SERVER ACTIONS
import { blockSpots } from "../../actions/server_actions/blockSpots";

interface BlockSpotsButtonProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    maxPlayers: number;
    currentBlockedSpots: number;
}

export const BlockSpotsButton = ({
    matchIdFromParams,
    teamNumber,
    maxPlayers,
    currentBlockedSpots
}: BlockSpotsButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();
    const [selectedSpots, setSelectedSpots] = useState<string>(
        currentBlockedSpots.toString()
    );
    const [isOpen, setIsOpen] = useState(false);

    const handleBlockSpots = () => {
        startTransition(async () => {
            const result = await blockSpots({
                matchIdFromParams,
                teamNumber,
                spotsToBlock: parseInt(selectedSpots)
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
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                >
                    <LockIcon className="h-4 w-4" />
                    {t('blockSpots')}
                </Button>
            </DialogTrigger>
            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('blockSpotsTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('blockSpotsDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Select
                        value={selectedSpots}
                        onValueChange={setSelectedSpots}
                        disabled={isPending}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectNumberOfSpots')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: maxPlayers + 1 }, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>
                                    {i} {t('spots')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleBlockSpots}
                        disabled={isPending}
                    >
                        {isPending ? t('blockingSpots') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};