"use client";

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from "next-intl";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { CardContent, CardFooter } from "@/components/ui/card";
import { AddMatchForm } from "./add-match-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER ACTIONS
import { addMatch } from "@/actions/server_actions/mutations/match/addMatch";

// TYPES
import type { typesUser } from "@/types/typesUser";

type AddMatchDetailsProps = {
    authToken: string;
    serverUserData: typesUser;
}

export const AddMatchDetails = ({ 
    authToken, 
    serverUserData 
}: AddMatchDetailsProps) => {
    const t = useTranslations("AddMatchPage");
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, setFieldValue, handleSubmit } = useForm({
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
            match_duration: 60,
            added_by: serverUserData.fullName,
            match_level: "",
            has_teams: false
        },
        validationSchema: addMatchSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addMatch(authToken, values);
                
                if (result.success) {
                    router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    return (
        <>
            <CardContent className="p-6">
                <AddMatchForm
                    authToken={authToken}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    setFieldValue={setFieldValue}
                />
            </CardContent>

            <CardFooter className="flex justify-end p-6">
                <Button 
                    disabled={isPending} 
                    className="w-full sm:w-[150px] font-bold" 
                    onClick={handleSubmit}
                >
                    {isPending ? t('adding') : t('addMatch')}
                </Button>
            </CardFooter>
        </>
    );
};