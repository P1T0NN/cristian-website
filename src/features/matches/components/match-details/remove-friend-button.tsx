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
import { RequestSubstituteDialog } from "./request-substitute-dialog";

// LUCIDE ICONS
import { UserMinus } from "lucide-react";

// SERVER ACTIONS
import { leaveMatch } from "../../actions/server_actions/leaveTeam";

interface RemoveFriendButtonProps {
    matchIdFromParams: string;
    currentUserId: string;
}

export const RemoveFriendButton = ({
    matchIdFromParams,
    currentUserId
}: RemoveFriendButtonProps) => {
    const t = useTranslations('MatchPage');
    
    const [isPending, startTransition] = useTransition();
    
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [isSubstituteDialogOpen, setIsSubstituteDialogOpen] = useState(false);

    const handleRemoveFriend = () => {
        startTransition(async () => {
            const result = await leaveMatch({
                matchIdFromParams,
                currentUserId,
                isRemovingFriend: true
            });

            if (result.success) {
                toast.success(result.message);
                setIsRemoveDialogOpen(false);
            } else {
                if (result.metadata?.code === 'TOO_LATE_TO_LEAVE') {
                    setIsRemoveDialogOpen(false);
                    setIsSubstituteDialogOpen(true);
                } else {
                    toast.error(result.message);
                }
            }
        });
    };

    return (
        <>
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {t('removeFriend')}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('removeFriendTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('removeFriendDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsRemoveDialogOpen(false)}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveFriend}
                            disabled={isPending}
                        >
                            {isPending ? t('removingFriend') : t('confirmRemoveFriend')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <RequestSubstituteDialog 
                isOpen={isSubstituteDialogOpen}
                onClose={() => setIsSubstituteDialogOpen(false)}
                matchIdFromParams={matchIdFromParams}
                currentUserId={currentUserId}
                playerType="temporary"
            />
        </>
    );
};
