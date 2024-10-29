"use client"

// REACTJS IMPORTS
import { useTransition } from "react";
import { useTranslations } from "next-intl";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useQueryClient } from "@tanstack/react-query";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddMatchForm } from "./add-match-form";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { addMatch } from "@/actions/functions/queries/add-match";

// TYPES
import type { typesUser } from "@/types/typesUser";

type AddMatchContentProps = {
    authToken: string;
    serverUserData: typesUser;
}

export const AddMatchContent = ({
    authToken,
    serverUserData 
}: AddMatchContentProps) => {
    const t = useTranslations("AddMatchPage");

    const router = useRouter();
    const queryClient = useQueryClient();

    const [isPending, startTransition] = useTransition();

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location: "",
            location_url: "",
            price: 0,
            team1_name: "",
            team2_name: "",
            starts_at_day: "",
            starts_at_hour: "",
            match_type: "",
            match_gender: "",
            added_by: serverUserData.fullName
        },
        validationSchema: addMatchSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addMatch(values);
                if (result.success) {
                    router.push(PAGE_ENDPOINTS.HOME_PAGE);
                    queryClient.invalidateQueries({ queryKey: ["matches"] });
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });
    
    return (
        <div className="flex w-full h-full py-10 justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>{t("hello")} {serverUserData.fullName}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent>
                    <AddMatchForm
                        authToken={authToken}
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                     />
                </CardContent>

                <CardFooter>
                    <Button disabled={isPending} className="w-[150px] font-bold" onClick={handleSubmit}>
                        {isPending ? t('adding') : t('addMatch')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
};