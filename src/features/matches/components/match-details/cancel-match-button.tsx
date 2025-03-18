"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

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
import { cancelMatch } from "../../actions/server_actions/cancelMatch";

// LUCIDE ICONS
import { XCircle } from "lucide-react";

interface CancelMatchButtonProps {
    matchIdFromParams: string;
}

export const CancelMatchButton = ({
    matchIdFromParams
}: CancelMatchButtonProps) => {
    const t = useTranslations('MatchPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleCancelMatch = () => {
        startTransition(async () => {
            const result = await cancelMatch({
                matchIdFromParams
            });

            if (result.success) {
                toast.success(result.message);
                router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center bg-amber-500 text-white hover:bg-amber-600"
                    disabled={isPending}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isPending ? t('cancelingMatch') : t('cancelMatch')}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('cancelMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('cancelMatchDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancelMatch}
                        className="bg-amber-500 text-white hover:bg-amber-600"
                    >
                        {isPending ? t('cancelingMatch') : t('confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}; 