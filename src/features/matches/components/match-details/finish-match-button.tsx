"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { finishMatch } from "../../actions/server_actions/finishMatch";

// LUCIDE ICONS
import { TrophyIcon } from "lucide-react";

interface FinishMatchButtonProps {
    matchIdFromParams: string;
}

export const FinishMatchButton = ({
    matchIdFromParams
}: FinishMatchButtonProps) => {
    const t = useTranslations('MatchPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleFinishMatch = () => {
        startTransition(async () => {
            const result = await finishMatch({
                matchIdFromParams
            });

            if (result.success) {
                toast.success(result.message);
                router.replace(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    size="sm"
                    className="inline-flex items-center bg-green-600 text-white hover:bg-green-700"
                    disabled={isPending}
                >
                    <TrophyIcon className="w-4 h-4 mr-2" />
                    {isPending ? t('finishingMatch') : t('finishMatch')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('finishMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('finishMatchDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleFinishMatch}
                        className="bg-green-600 text-white hover:bg-green-700"
                    >
                        {isPending ? t('finishingMatch') : t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
