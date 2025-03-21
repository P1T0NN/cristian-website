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
import { PlusCircle } from "lucide-react";

// SERVER ACTIONS
import { addExtraSpots } from "../../actions/server_actions/addExtraSpots";

interface AddSpotsButtonProps {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    matchType: string;
    currentExtraSpots: number;
}

export const AddSpotsButton = ({
    matchIdFromParams,
    teamNumber,
    matchType,
    currentExtraSpots
}: AddSpotsButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();
    const [selectedSpots, setSelectedSpots] = useState<string>("1");
    const [isOpen, setIsOpen] = useState(false);

    // Get maximum remaining spots that can be added (maximum 3 total)
    const maxRemainingSpots = 3 - currentExtraSpots;

    // Calculate the base team size based on match type
    let baseTeamSize = 8; // Default for F8
    if (matchType === 'F7') {
        baseTeamSize = 7;
    } else if (matchType === 'F11') {
        baseTeamSize = 11;
    }

    // Calculate what the new total will be
    const newTotalSpots = baseTeamSize + currentExtraSpots + parseInt(selectedSpots || "0");

    const handleAddSpots = () => {
        startTransition(async () => {
            const result = await addExtraSpots({
                matchIdFromParams,
                teamNumber,
                spotsToAdd: parseInt(selectedSpots)
            });

            if (result.success) {
                toast.success(result.message);
                setIsOpen(false);
            } else {
                toast.error(result.message);
            }
        });
    };

    // Don't render the button if already at max extra spots
    if (maxRemainingSpots <= 0) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                >
                    <PlusCircle className="h-4 w-4" />
                    {t('addSpots')}
                </Button>
            </DialogTrigger>
            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('addSpotsTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('addSpotsDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="text-sm">
                        <p className="mb-2">{t('currentTeamFormat')}: {matchType}</p>
                        <p className="mb-2">{t('currentExtraSpots')}: {currentExtraSpots}</p>
                        <p className="mb-2">{t('currentTeamSize')}: {baseTeamSize + currentExtraSpots}</p>
                        <p className="mb-4 font-medium">{t('afterAddingSpots')}: {newTotalSpots}</p>
                    </div>

                    <Select
                        value={selectedSpots}
                        onValueChange={setSelectedSpots}
                        disabled={isPending}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t('selectNumberOfSpots')} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: maxRemainingSpots }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1} {t('extraSpots')}
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
                        onClick={handleAddSpots}
                        disabled={isPending}
                    >
                        {isPending ? t('addingSpots') : t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 