"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// NEXTJS IMPORTS
import { useTranslations } from "next-intl";

// COMPONENTS
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { FormInputField } from "@/shared/components/ui/forms/form-input-field";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/shared/hooks/useForm";
import { useZodSchemas } from "@/shared/hooks/useZodSchema";

// SERVER ACTIONS
import { addLocation } from "../../actions/server_actions/addLocation";

export const AddLocationDialog = () => {
    const t = useTranslations("AddLocationPage");

    const [isPending, startTransition] = useTransition();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { addLocationSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location_name: "",
            location_url: ""
        },
        validationSchema: addLocationSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addLocation({
                    addLocationData: values
                });
                
                if (result.success) {
                    toast.success(result.message);
                    setIsDialogOpen(false);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>{t("addNewLocation")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("addNewLocation")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <FormInputField
                        label={t("location")}
                        name="location_name"
                        type="text"
                        value={formData.location_name}
                        onChange={handleInputChange}
                        placeholder={t('locationPlaceholder')}
                        error={errors.location_name}
                    />
                    <FormInputField
                        label={t("locationUrl")}
                        name="location_url"
                        type="url"
                        value={formData.location_url}
                        onChange={handleInputChange}
                        placeholder={t('locationUrlPlaceholder')}
                        error={errors.location_url}
                    />
                </div>
                <DialogFooter>
                    <Button disabled={isPending} onClick={handleSubmit}>
                        {isPending ? t('adding') : t('addLocation')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};