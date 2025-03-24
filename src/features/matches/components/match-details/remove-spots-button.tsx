"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";

// SERVER ACTIONS
import { removeExtraSpots } from "../../actions/server_actions/removeExtraSpots";

// LUCIDE ICONS
import { MinusCircle } from "lucide-react";

interface RemoveSpotsButtonProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    currentExtraSpots: number;
}

export const RemoveSpotsButton = ({
    matchIdFromParams,
    teamNumber,
    currentExtraSpots
}: RemoveSpotsButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [spotsToRemove, setSpotsToRemove] = useState<string>("");

    // Only show options up to the current number of extra spots
    const spotOptions = Array.from({ length: currentExtraSpots }, (_, i) => ({
        value: String(i + 1),
        label: String(i + 1)
    }));

    const handleRemoveSpots = () => {
        if (!spotsToRemove) {
            toast.error(t('selectNumberOfSpots'));
            return;
        }

        startTransition(async () => {
            const result = await removeExtraSpots({
                matchIdFromParams,
                teamNumber,
                spotsToRemove: parseInt(spotsToRemove)
            });

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
                setSpotsToRemove("");
            } else {
                toast.error(result.message);
            }
        });
    };

    // Don't render the button if there are no extra spots to remove
    if (currentExtraSpots <= 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    disabled={isPending}
                >
                    <MinusCircle className="h-4 w-4" />
                    {t('removeSpots')}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('removeSpotsTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('removeSpotsDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Select
                            value={spotsToRemove}
                            onValueChange={setSpotsToRemove}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('selectSpotsToRemove')} />
                            </SelectTrigger>
                            <SelectContent>
                                {spotOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleRemoveSpots}
                        disabled={isPending || !spotsToRemove}
                    >
                        {isPending ? t('removingSpots') : t('removeSpots')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 