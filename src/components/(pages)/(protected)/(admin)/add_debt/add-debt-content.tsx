"use client";

// REACTJS IMPORTS
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

// NEXTJS IMPORTS
import { useRouter, useSearchParams } from "next/navigation";

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddDebtForm } from "./add-debt-form";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER ACTIONS
import { addDebt } from "@/actions/server_actions/mutations/debt/addDebt";

// ACTIONS
import { clientFetchUserIdByName } from "@/actions/functions/data/client/debt/client_fetchUserIdByName";

// TYPES
import type { typesUser } from "@/types/typesUser";

type HomeContentProps = {
    authToken: string;
    serverUserData: typesUser;
}

export const AddDebtContent = ({ 
    authToken,
    serverUserData 
}: HomeContentProps) => {
    const t = useTranslations("AddDebtPage");

    const router = useRouter();
    const searchParams = useSearchParams();
    const playerName = searchParams.get('playerName') || '';

    const [isPending, startTransition] = useTransition();
    const [selectedOption, setSelectedOption] = useState<'player' | 'cristian'>('player');

    const { addDebtSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            player_name: playerName,
            player_debt: 0,
            cristian_debt: 0,
            reason: "",
            added_by: serverUserData.fullName
        },
        validationSchema: addDebtSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addDebt(authToken, values);

                if (result.success) {
                    const userIdResult = await clientFetchUserIdByName(authToken, values.player_name);

                    if (userIdResult.success && userIdResult.data && userIdResult.data) {
                        router.push(`${PROTECTED_PAGE_ENDPOINTS.PLAYER_PAGE}/${userIdResult.data}`);
                    } else {
                        router.push(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                    }

                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    return (
        <div className="flex w-full h-full items-center justify-center">
            <Card>
                <CardHeader>
                    <CardTitle>{t("hello")} {serverUserData.fullName}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent>
                    <AddDebtForm
                        authToken={authToken}
                        formData={formData}
                        errors={errors}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        handleInputChange={handleInputChange}
                        initialPlayerName={playerName}
                    />
                </CardContent>

                <CardFooter>
                    <Button disabled={isPending} className="w-[150px] font-bold" onClick={handleSubmit}>
                        {isPending ? t("adding") : t("addDebt")}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};