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

// SERVER ACTIONS
import { cancelSubstitute } from "../../actions/server_actions/cancelSubstitutionRequest";

// LUCIDE ICONS
import { UserX2 } from "lucide-react";

interface CancelSubstituteButtonProps {
    matchIdFromParams: string;
    currentUserId: string;
    playerType: 'regular' | 'temporary';
}

export const CancelSubstituteButton = ({
    matchIdFromParams,
    currentUserId,
    playerType
}: CancelSubstituteButtonProps) => {
    const t = useTranslations('MatchPage');
    
    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);

    const handleCancelSubstitute = () => {
        startTransition(async () => {
            const result = await cancelSubstitute({
                matchIdFromParams,
                currentUserId,
                playerType
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
                    variant="destructive"
                    size="sm"
                >
                    <UserX2 className="h-4 w-4 mr-2" />
                    {t(playerType === 'temporary' ? 'cancelFriendSubstitute' : 'cancelSubstitute')}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t(playerType === 'temporary' ? 'cancelFriendSubstituteTitle' : 'cancelSubstituteTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(playerType === 'temporary' ? 'cancelFriendSubstituteDescription' : 'cancelSubstituteDescription')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancelSubstitute}
                        disabled={isPending}
                    >
                        {isPending ? 
                            t(playerType === 'temporary' ? 'cancelingFriendSubstitute' : 'cancelingSubstitute') : 
                            t(playerType === 'temporary' ? 'confirmCancelFriendSubstitute' : 'confirmCancelSubstitute')
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};