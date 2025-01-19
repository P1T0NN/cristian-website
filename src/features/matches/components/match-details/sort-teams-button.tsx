"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { sortTeams } from "../../actions/server_actions/sortTeams";

// LUCIDE ICONS
import { Users } from 'lucide-react';

type SortTeamsButtonProps = {
    matchIdFromParams: string;
}

export const SortTeamsButton = ({
    matchIdFromParams
}: SortTeamsButtonProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();
    
    const handleSortTeams = () => {
        startTransition(async () => {
            const response = await sortTeams({
                matchIdFromParams: matchIdFromParams
            })

            if (response.success) {
                toast.success(response.message)
            } else {
                toast.error(response.message)
            }
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    className="bg-blue-500 hover:bg-blue-500/80 w-full sm:w-auto"
                    disabled={isPending}
                >
                    <Users className="mr-2 h-4 w-4" /> {isPending ? t('sorting') : t('sortTeams')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('sortTeamsConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('sortTeamsConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-blue-500 hover:bg-blue-500/80"
                        onClick={handleSortTeams} 
                        disabled={isPending}
                    >
                        {isPending ? t('sorting') : t('sortTeams')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
