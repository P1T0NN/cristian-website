"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";

// ACTIONS
import { editMatchInstructions } from "../../actions/server_actions/editMatchInstructions";

// LUCIDE ICONS
import { Pencil } from "lucide-react";

type EditInstructionsDialogProps = {
    matchIdFromParams: string
    matchInstructions: string
}

export const EditMatchInstructionsDialog = ({
    matchIdFromParams,
    matchInstructions,
}: EditInstructionsDialogProps) => {
    const t = useTranslations("MatchPage");
    
    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [editedInstructions, setEditedInstructions] = useState(matchInstructions);

    const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedInstructions(e.target.value);
    };

    const handleEditMatchInstructions = () => {
        startTransition(async () => {
            const response = await editMatchInstructions({ matchId: matchIdFromParams, matchInstructions: editedInstructions });

            if (response.success) {
                setOpen(false);
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        });
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            setEditedInstructions(matchInstructions);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('editInstructions')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('editInstructions')}</DialogTitle>
                </DialogHeader>
                <form action={handleEditMatchInstructions} className="space-y-4 py-4">
                    <div className="space-y-4">
                        <Textarea
                            id="instructions"
                            name="instructions"
                            value={editedInstructions}
                            onChange={handleInstructionsChange}
                            className="min-h-[200px]"
                            placeholder={t('enterInstructions')}
                            disabled={isPending}
                            required
                            aria-label={t('editInstructions')}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-[150px]"
                        >
                            {isPending ? t('saving') : t('save')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};