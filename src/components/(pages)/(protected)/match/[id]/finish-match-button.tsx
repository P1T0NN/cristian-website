"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// SERVER ACTIONS
import { finishMatch } from "@/actions/server_actions/mutations/match/finishMatch";

// LUCIDE ICONS
import { Check } from "lucide-react";

type FinishMatchButtonProps = {
    authToken: string;
    matchId: string;
}

export const FinishMatchButton = ({
    authToken,
    matchId
}: FinishMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter();
    
    const [isPending, startTransition] = useTransition();
    
    const handleFinishMatch = () => {
        startTransition(async () => {
            const response = await finishMatch(authToken, matchId)

            if (response.success) {
                toast.success(response.message)
                router.replace(PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(response.message)
            }
        })
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    className="bg-green-500 hover:bg-green-500/80"
                    disabled={isPending}
                >
                    <Check className="mr-2 h-4 w-4" /> {isPending ? t('finishing') : t('finishMatch')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('finishConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('finishConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-green-500 hover:bg-green-500/80"
                        onClick={handleFinishMatch} 
                        disabled={isPending}
                    >
                        {isPending ? t('finishing') : t('finishMatch')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}