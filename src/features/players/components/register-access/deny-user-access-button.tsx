"use client"

// REACJTS IMPORTS
import { useTransition, useState } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";

// SERVER ACTIONS
import { denyUserAccess } from "../../actions/server_actions/player_management/denyUserAccess";

type DenyUserAccessButtonProps = {
    userId: string;
}

export const DenyUserAccessButton = ({
    userId
}: DenyUserAccessButtonProps) => {
    const t = useTranslations("AccessForRegistrationPage");

    const [isPending, startTransition] = useTransition();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDenyUserAccess = () => {
        startTransition(async () => {
            const response = await denyUserAccess({
                userId: userId
            })

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