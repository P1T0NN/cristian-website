"use client"

// REACTJS IMPORTS:
import { useState, useTransition } from "react";

// LIBRARIES
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInputField } from "@/components/ui/forms/form-input-field";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER ACTIONS
import { addTeam } from "@/actions/server_actions/mutations/team/addTeam";

type AddTeamDialogProps = {
    authToken: string
}

export const AddTeamDialog = ({
    authToken
}: AddTeamDialogProps) => {
    const t = useTranslations("AddTeamPage");
    const [isPending, startTransition] = useTransition();
    
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { addTeamSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            team_name: "",
            team_level: ""
        },
        validationSchema: addTeamSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addTeam(authToken, values)
                
                if (result.success) {
                    toast.success(result.message)
                    setIsDialogOpen(false)
                } else {
                    toast.error(result.message)
                }
            })
        },
    })

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>{t("addNewTeam")}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("addNewTeam")}</DialogTitle>
                    <DialogDescription>{t("fillTeamDetails")}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <FormInputField
                        label={t("teamName")}
                        name="team_name"
                        type="text"
                        value={formData.team_name}
                        onChange={handleInputChange}
                        placeholder={t('teamNamePlaceholder')}
                        error={errors.team_name}
                    />
                    <FormInputField
                        label={t("teamLevel")}
                        name="team_level"
                        type="text"
                        value={formData.team_level}
                        onChange={handleInputChange}
                        placeholder={t('teamLevelPlaceholder')}
                        error={errors.team_level}
                    />
                </div>
                <DialogFooter>
                    <Button disabled={isPending} onClick={handleSubmit}>
                        {isPending ? t('adding') : t('addTeam')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}