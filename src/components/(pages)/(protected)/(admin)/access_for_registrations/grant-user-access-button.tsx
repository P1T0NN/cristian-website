"use client"

// REACTJS IMPORTS
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
import { grantUserAccess } from "@/actions/server_actions/mutations/user/grantUserAccess";

type GrantUserAccessButtonProps = {
    authToken: string;
    userId: string;
}

export const GrantUserAccessButton = ({
    authToken,
    userId
}: GrantUserAccessButtonProps) => {
    const t = useTranslations("AccessForRegistrationPage");

    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleGiveUserRegistrationAccess = () => {
        startTransition(async () => {
            const response = await grantUserAccess(authToken, userId)

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
                    variant="outline" 
                    size="sm"
                >
                    {isPending ? t('givingAccess') : t('grantAccess')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('confirmAccessTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('confirmAccessDescription')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {t('cancel')}
                    </Button>
                    <Button 
                        onClick={handleGiveUserRegistrationAccess}
                        disabled={isPending}
                    >
                        {isPending ? t('givingAccess') : t('confirmGrant')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}