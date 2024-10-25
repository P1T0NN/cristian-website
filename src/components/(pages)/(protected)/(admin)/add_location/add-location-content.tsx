"use client"

// REACTJS IMPORTS
import { useTransition } from "react";
import { useTranslations } from "next-intl";

// NEXTJS IMPORTS
import { useRouter } from "next/navigation";

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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { addLocation } from "@/actions/functions/queries/add-location";

// TYPES
import type { typesUser } from "@/types/typesUser";

type AddLocationProps = {
    serverUserData: typesUser;
}

export const AddLocationContent = ({ 
    serverUserData 
}: AddLocationProps) => {
    const t = useTranslations("AddLocationPage");

    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { addLocationSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location_name: ""
        },
        validationSchema: addLocationSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await addLocation(values);
                if (result.success) {
                    router.push(PAGE_ENDPOINTS.HOME_PAGE);
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
                    <div className="flex flex-col space-y-4">
                        <div className="relative w-[450px] space-y-1">
                            <Label htmlFor="location">{t("location")}</Label>
                            <Input
                                type="text"
                                name="location_name"
                                value={formData.location_name}
                                onChange={handleInputChange}
                                placeholder={t('locationPlaceholder')}
                            />
                            {errors.location_name && <p className="text-sm text-red-500">{errors.location_name}</p>}
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button disabled={isPending} className="w-[150px] font-bold" onClick={handleSubmit}>
                        {isPending ? t('adding') : t('addLocation')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
};