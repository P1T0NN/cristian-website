"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"

// NEXTJS IMPORTS
import { useRouter } from "next/navigation"

// LIBRARIES
import { useQueryClient } from "@tanstack/react-query"

// CONFIG
import { PAGE_ENDPOINTS } from "@/config"

// COMPONENTS
import { 
    AlertDialog, 
    AlertDialogTrigger, 
    AlertDialogContent, 
    AlertDialogHeader,
    AlertDialogTitle, 
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogFooter, 
    AlertDialogCancel 
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// SERVER ACTIONS
import { deleteMatch } from "@/actions/server_actions/mutations/match/deleteMatch"

// TYPES
import type { typesMatch } from "@/types/typesMatch"

type DeleteMatchButtonProps = {
    authToken: string;
    match: typesMatch;
}

export const DeleteMatchButton = ({
    authToken,
    match
}: DeleteMatchButtonProps) => {
    const t = useTranslations("MatchPage");
    const router = useRouter()
    const queryClient = useQueryClient()

    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)

    const handleDeleteMatch = async () => {
        startTransition(async () => {
            try {
                const result = await deleteMatch(authToken, match.id)
                if (result.success) {
                    queryClient.invalidateQueries({ queryKey: ["matches"] })
                    toast.success(result.message)
                    router.push(PAGE_ENDPOINTS.HOME_PAGE)
                } else {
                    toast.error(result.message)
                }
            } finally {
                setIsOpen(false)
            }
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
            <AlertDialogTrigger asChild>
                <Button 
                    className="bg-red-500 hover:bg-red-500/80 w-full"
                    onClick={() => setIsOpen(true)}
                    disabled={isPending}
                >
                    {isPending ? t('deleting') : t('deleteMatch')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteMatchTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('deleteMatchConfirmation')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteMatch}
                        className="bg-red-500 hover:bg-red-500/80"
                        disabled={isPending}
                    >
                        {isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}