"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";

// SERVER ACTIONS
import { editMatchInstructions } from "../../actions/server_actions/editMatchInstructions";

// LUCIDE ICONS
import { Pencil } from "lucide-react";

interface EditMatchInstructionsButtonProps {
    matchId: string;
    currentInstructions: string;
}

export const EditMatchInstructionsButton = ({
    matchId,
    currentInstructions
}: EditMatchInstructionsButtonProps) => {
    const t = useTranslations('MatchPage');

    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [instructions, setInstructions] = useState(currentInstructions);

    const handleSave = () => {
        startTransition(async () => {
            const response = await editMatchInstructions({
                matchId,
                matchInstructions: instructions
            });

            if (response.success) {
                toast.success(response.message);
                setOpen(false);
            } else {
                toast.error(response.message);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setOpen(true)}
                    className="h-8 w-8"
                    disabled={isPending}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('editInstructions')}</DialogTitle>
                </DialogHeader>

                <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={t('enterMatchInstructions')}
                    className="min-h-[100px] resize-none"
                />

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isPending}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? t('saving') : t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};