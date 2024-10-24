"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// ACTIONS
import { requestPasswordReset } from "@/actions/functions/auth/auth";

// UTILS
import { executeWithMinimumDuration } from "@/utils/timeoutForFunctions";

// LUCIDE ICONS
import { Mail } from "lucide-react";

export const ForgotPasswordContent = () => {
    const [isPending, startTransition] = useTransition();
    
    const { forgotPasswordSchema } = useZodSchemas();
    const t = useTranslations('ForgotPasswordPage');

    const { formData, errors, handleInputChange, handleSubmit } = useForm<ForgotPasswordForm>({
        initialValues: { email: '' },
        validationSchema: forgotPasswordSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await executeWithMinimumDuration(
                    () => requestPasswordReset(values.email),
                    3000 // 3 seconds
                );
                
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    return (
        <section className="flex w-full min-h-screen justify-center">
            <div className="flex flex-col pt-16 items-center space-y-7">
                <div className="flex flex-col items-center space-y-7">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="w-[60%] text-center">{t('description')}</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col space-y-7">
                    <div className="relative w-[350px] space-y-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="email"
                            name="email"
                            className="pl-12 w-full"
                            placeholder={t('emailPlaceholder')}
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="flex items-center">
                        <Button
                            type="submit"
                            className="w-full font-bold"
                            disabled={isPending}
                        >
                            {isPending ? t('sending') : t('sendResetLink')}
                        </Button>
                    </div>

                    <div className="flex flex-col items-center space-y-10">
                        <Separator />
                        <Link href={PAGE_ENDPOINTS.LOGIN_PAGE} className="underline">{t('backToLogin')}</Link>
                    </div>
                </form>
            </div>
        </section>
    );
};