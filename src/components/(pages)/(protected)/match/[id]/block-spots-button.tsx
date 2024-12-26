"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { toast } from "sonner";

// SERVER ACTIONS
import { blockSpots } from "@/actions/server_actions/mutations/match/blockSpots";

type BlockSpotsButtonProps = {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export const BlockSpotsButton = ({ 
    matchIdFromParams, 
    teamNumber, 
}: BlockSpotsButtonProps) => {
    const t = useTranslations("MatchPage");

    const [isPending, startTransition] = useTransition();

    const [isOpen, setIsOpen] = useState(false);
    const [spots, setSpots] = useState("");
    const [error, setError] = useState("");
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSpots(e.target.value);
        setError("");
    }
  
    const handleBlockSpots = () => {
        if (!spots.trim()) {
            setError(t("emptyFieldError"));
            return;
        }

        const spotsToBlock = parseInt(spots, 10);

        if (isNaN(spotsToBlock) || spotsToBlock < 0) {
            setError(t("invalidSpotsNumber"));
            return;
        }

        startTransition(async () => {
            const result = await blockSpots({
                matchIdFromParams: matchIdFromParams, 
                teamNumber: teamNumber, 
                spotsToBlock: spotsToBlock
            });
            
            if (result.success) {
                setIsOpen(false);
                setSpots("");

                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }
  
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">{t("blockSpotsButtonText")}</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("blockSportsDialogTitle")}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <FormInputField
                        name="spots"
                        type="number"
                        value={spots}
                        onChange={handleInputChange}
                        label={t("spotsLabel")}
                        placeholder={t("spotsPlaceholder")}
                        error={error}
                        autoComplete="off"
                    />
                </div>
                
                <Button onClick={handleBlockSpots} className="w-full" disabled={isPending}>
                    {isPending ? t("saving") : t("confirm")}
                </Button>
            </DialogContent>
        </Dialog>
    )
}