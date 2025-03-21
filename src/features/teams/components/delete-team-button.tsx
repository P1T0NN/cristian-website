"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { toast } from "sonner";

// SERVER ACTIONS
import { deleteTeam } from "../actions/server_actions/deleteTeam";

// LUCIDE ICONS
import { Trash2 } from "lucide-react";

type DeleteTeamButtonProps = {
    teamId: string
}

export function DeleteTeamButton({ 
    teamId
}: DeleteTeamButtonProps) {
    const t = useTranslations("AddTeamPage");
    
    const [isPending, startTransition] = useTransition();

    const handleDeleteTeam = async () => {
        startTransition(async () => {
            const result = await deleteTeam({
                teamId: teamId
            })
            
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteTeamConfirmation")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("deleteTeamWarning")}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteTeam} 
                        disabled={isPending}
                    >
                        {isPending ? t("deleting") : t("delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}