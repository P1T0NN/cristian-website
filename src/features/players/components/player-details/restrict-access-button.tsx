"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

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
import { restrictUserAccess } from "../../actions/server_actions/restrictUserAccess";

// LUCIDE ICONS
import { ShieldOff } from "lucide-react"

interface RestrictAccessButtonProps {
    playerId: string
    playerName: string
    isAdmin: boolean
}

export const RestrictAccessButton = ({
    playerId,
    playerName,
    isAdmin,
}: RestrictAccessButtonProps) => {
    const t = useTranslations("PlayerPage");
  
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
  
    // Only admins should be able to restrict access
    if (!isAdmin) {
        return null;
    }
  
    const handleRestrictAccess = () => {
        startTransition(async () => {
            const result = await restrictUserAccess({ playerIdFromParams: playerId });
            
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
            
            setIsOpen(false);
        })
    }
  
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={isPending}
                >
                    <ShieldOff className="h-4 w-4" />
                    {isPending ? t("restricting") : t("restrictAccess")}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("restrictAccessTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("restrictAccessDescription", { playerName })}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        {t("cancel")}
                    </AlertDialogCancel>

                    <AlertDialogAction 
                        onClick={handleRestrictAccess}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending ? t("confirming") : t("confirmRestrictAccess")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}