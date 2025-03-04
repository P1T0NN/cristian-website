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
import { CardContent, CardFooter } from "@/shared/components/ui/card";
import { AddMatchForm } from "./add-match-form";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/shared/hooks/useForm";
import { useZodSchemas } from "@/shared/hooks/useZodSchema";

// SERVER ACTIONS
import { addMatch } from "../../actions/server_actions/addMatch";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesLocation } from "@/features/locations/types/typesLocation";
import { typesMatchStatus } from "../../types/typesMatch";

type AddMatchDetailsProps = {
    serverUserData: typesUser;
    locationsData: typesLocation[];
    defaultLocationsData: typesLocation[];
}

export const AddMatchDetails = ({ 
    serverUserData,
    locationsData,
    defaultLocationsData
}: AddMatchDetailsProps) => {
    const t = useTranslations("AddMatchPage");
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, setFieldValue, handleSubmit, validateForm } = useForm({
        initialValues: {
            location: "",
            locationUrl: "",
            price: "4.5",
            team1Name: "",
            team2Name: "",
            startsAtDay: "",
            startsAtHour: "08:00",
            matchType: "F8",
            matchGender: "Male",
            matchDuration: 60,
            addedBy: serverUserData.name,
            matchLevel: "",
            hasTeams: false,
            status: "active" as typesMatchStatus
        },
        validationSchema: addMatchSchema,
        useToastForErrors: true,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addMatch({
                    addMatchData: values
                });
                
                if (result.success) {
                    router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    const handleFormSubmit = () => {
        if (validateForm()) {
            handleSubmit();
        }
    };

    return (
        <>
            <CardContent className="p-6">
                <AddMatchForm
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    setFieldValue={setFieldValue}
                    locationsData={locationsData}
                    defaultLocationsData={defaultLocationsData}
                />
            </CardContent>

            <CardFooter className="flex justify-end p-6">
                <Button 
                    disabled={isPending} 
                    className="w-full sm:w-[150px] font-bold" 
                    onClick={handleFormSubmit}
                >
                    {isPending ? t('adding') : t('addMatch')}
                </Button>
            </CardFooter>
        </>
    );
};