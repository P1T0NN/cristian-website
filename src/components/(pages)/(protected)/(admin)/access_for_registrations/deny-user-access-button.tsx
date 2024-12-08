"use client"

// REACJTS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// SERVER ACTIONS
import { denyUserAccess } from "@/actions/server_actions/mutations/user/denyUserAccess";

type DenyUserAccessButtonProps = {
    authToken: string;
    userId: string;
}

export const DenyUserAccessButton = ({
    authToken,
    userId
}: DenyUserAccessButtonProps) => {
    const t = useTranslations("AccessForRegistrationPage");

    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDenyUserAccess = () => {
        startTransition(async () => {
            const response = await denyUserAccess(authToken, userId)

            if (response.success) {
                toast.success(response.message);
                setIsDialogOpen(false);
            } else {
                toast.error(response.message);
            }
        });
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button 
                    type="button"
                    variant="destructive" 
                    size="sm"
                >
                    {isPending ? t('denyingAccess') : t('denyAccess')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmDenyAccessTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('confirmDenyAccessDescription')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {t('cancel')}
                    </Button>
                    <Button 
                        onClick={handleDenyUserAccess}
                        disabled={isPending}
                        variant="destructive"
                    >
                        {isPending ? t('denyingAccess') : t('confirmDeny')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}