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
import { DoorOpen } from "lucide-react";

// SERVER ACTIONS
import { leaveMatch } from "../../actions/server_actions/leaveTeam";

interface LeaveMatchButtonProps {
    matchIdFromParams: string;
}

export const LeaveMatchButton = ({
    matchIdFromParams
}: LeaveMatchButtonProps) => {
    const t = useTranslations('MatchPage');
    
    const [isPending, startTransition] = useTransition();
    
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [isSubstituteDialogOpen, setIsSubstituteDialogOpen] = useState(false);

    const handleLeaveMatch = () => {
        startTransition(async () => {
            const result = await leaveMatch({
                matchIdFromParams,
            });

            if (result.success) {
                toast.success(result.message);
                setIsLeaveDialogOpen(false);
            } else {
                if (result.code === 'TOO_LATE_TO_LEAVE') {
                    setIsLeaveDialogOpen(false);
                    setIsSubstituteDialogOpen(true);
                } else {
                    toast.error(result.message);
                }
            }
        });
    };

    return (
        <>
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <DoorOpen className="h-4 w-4 mr-2" />
                        {t('leaveMatch')}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('leaveMatchTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('leaveMatchDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsLeaveDialogOpen(false)}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeaveMatch}
                            disabled={isPending}
                        >
                            {isPending ? t('leaving') : t('confirmLeave')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <RequestSubstituteDialog 
                isOpen={isSubstituteDialogOpen}
                onClose={() => setIsSubstituteDialogOpen(false)}
                matchIdFromParams={matchIdFromParams}
            />
        </>
    );
};