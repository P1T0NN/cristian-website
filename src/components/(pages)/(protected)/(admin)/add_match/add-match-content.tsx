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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { addMatch } from "@/actions/functions/queries/add-match";

// TYPES
import type { typesUser } from "@/types/typesUser";

type HomeContentProps = {
    serverUserData: typesUser;
}

export const AddMatchContent = ({ 
    serverUserData 
}: HomeContentProps) => {
    const t = useTranslations("AddMatchPage");

    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { addMatchSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            location: "",
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
                    <div className="flex flex-col space-y-4">
                        <Input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder={t('locationPlaceholder')}
                        />
                        {errors.location && <p className="text-red-500">{errors.location}</p>}
                        
                        <Input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder={t('pricePlaceholder')}
                        />
                        {errors.price && <p className="text-red-500">{errors.price}</p>}
                        
                        <Input
                            type="text"
                            name="team1_name"
                            value={formData.team1_name}
                            onChange={handleInputChange}
                            placeholder={t('team1NamePlaceholder')}
                        />
                        {errors.team1_name && <p className="text-red-500">{errors.team1_name}</p>}
                        
                        <Input
                            type="text"
                            name="team2_name"
                            value={formData.team2_name}
                            onChange={handleInputChange}
                            placeholder={t('team2NamePlaceholder')}
                        />
                        {errors.team2_name && <p className="text-red-500">{errors.team2_name}</p>}
                        
                        <Input
                            type="date"
                            name="starts_at_day"
                            value={formData.starts_at_day}
                            onChange={handleInputChange}
                        />
                        {errors.starts_at_day && <p className="text-red-500">{errors.starts_at_day}</p>}
                        
                        <Input
                            type="time"
                            name="starts_at_hour"
                            value={formData.starts_at_hour}
                            onChange={handleInputChange}
                        />
                        {errors.starts_at_hour && <p className="text-red-500">{errors.starts_at_hour}</p>}
                        
                        <Input
                            type="text"
                            name="match_type"
                            value={formData.match_type}
                            onChange={handleInputChange}
                            placeholder={t('matchTypePlaceholder')}
                        />
                        {errors.match_type && <p className="text-red-500">{errors.match_type}</p>}
                        
                        <Input
                            type="text"
                            name="match_gender"
                            value={formData.match_gender}
                            onChange={handleInputChange}
                            placeholder={t('matchGenderPlaceholder')}
                        />
                        {errors.match_gender && <p className="text-red-500">{errors.match_gender}</p>}
                    </div>
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