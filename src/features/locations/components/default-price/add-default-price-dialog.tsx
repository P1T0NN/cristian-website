"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// LIBRARIES
import { useTranslations } from "next-intl";

// COMPONENTS
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { toast } from "sonner";

// SERVER ACTIONS
import { updateDefaultPrice } from "../../actions/server_actions/updateDefaultPrice";

// TYPES
import type { typesLocation } from "../../types/typesLocation";

// LUCIDE ICONS
import { DollarSign } from 'lucide-react';

type AddDefaultPriceDialogProps = {
    location: typesLocation;
}

export const AddDefaultPriceDialog = ({ 
    location, 
}: AddDefaultPriceDialogProps) => {
    const t = useTranslations("AddLocationPage");

    const [isPending, startTransition] = useTransition();

    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(location.default_price || "");
    const [error, setError] = useState("");

    const handleChangeDefaultPrice = () => {
        if (!price.trim()) {
            setError(t("PRICE_CANNOT_BE_EMPTY"));
            return;
        }

        startTransition(async () => {
            const result = await updateDefaultPrice({
                locationId: location.id, 
                defaultPrice: price
            });
            
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                setError("");
            } else {
                toast.error(result.message);
                setError(result.message);
            }
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(e.target.value);
        setError("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    {location.default_price ? t("updateDefaultPrice") : t("addDefaultPrice")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("setDefaultPrice")}</DialogTitle>
                </DialogHeader>

                <FormInputField
                    name="price"
                    type="text"
                    value={price}
                    onChange={handlePriceChange}
                    placeholder={t("enterPrice")}
                    error={error}
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <Button type="button" onClick={handleChangeDefaultPrice} disabled={isPending}>
                    {isPending ? t("saving") : t("save")}
                </Button>
            </DialogContent>
        </Dialog>
    );
};
