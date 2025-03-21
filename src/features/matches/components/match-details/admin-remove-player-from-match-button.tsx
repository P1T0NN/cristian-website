"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

// SERVER ACTIONS
import { leaveMatch } from "../../actions/server_actions/leaveTeam";

// LUCIDE ICONS
import { UserX } from "lucide-react";

interface AdminRemovePlayerFromMatchButtonProps {
    id: string;
    matchIdFromParams: string;
    playerType: 'regular' | 'temporary';
}

export const AdminRemovePlayerFromMatchButton = ({
    id,
    matchIdFromParams,
    playerType
}: AdminRemovePlayerFromMatchButtonProps) => {
    const t = useTranslations('MatchPage');
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRemovePlayer = () => {
        startTransition(async () => {
            // The server action will handle permission checks
            const result = await leaveMatch({
                matchIdFromParams,
                isRemovingFriend: playerType === 'temporary',
                adminOverride: true,
                playerId: id
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
            
            setIsDialogOpen(false);
        });
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="text-red-600 hover:bg-red-100 hover:text-red-700 h-10 w-10"
                            onClick={() => setIsDialogOpen(true)}
                            disabled={isPending}
                        >
                            <UserX className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isPending ? t('removingPlayer') : t('removePlayer')}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('removePlayerTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('removePlayerDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleRemovePlayer}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? t('removingPlayer') : t('removePlayer')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
