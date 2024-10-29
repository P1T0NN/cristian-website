"use client"

// REACTJS IMPORTS
import { useState, useTransition } from "react";

// NEXTJS IMPORTS
import { useTranslations } from "next-intl";

// LIBRARIES
import { useQueryClient } from "@tanstack/react-query";

// COMPONENTS
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { addLocation } from "@/actions/functions/queries/add-location";

export const AddLocationDialog = () => {
    const t = useTranslations("AddLocationPage");

    const queryClient = useQueryClient();

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
                const result = await addLocation(values);
                if (result.success) {
                    queryClient.invalidateQueries({ queryKey: ['locations' ]});
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
                <Card>
                    <CardContent className="pt-4 space-y-4">
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
                    </CardContent>
                    <CardFooter>
                        <Button disabled={isPending} onClick={handleSubmit}>
                            {isPending ? t('adding') : t('addLocation')}
                        </Button>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
};