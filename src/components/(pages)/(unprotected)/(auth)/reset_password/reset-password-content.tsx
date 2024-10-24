"use client"

// REACTJS IMPORTS
import { useEffect, useTransition, useState, useCallback } from "react";

// NEXTJS IMPORTS
import { useRouter, useSearchParams } from "next/navigation";

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { ResetPasswordForm } from "./reset-password-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// UTILS
import { resetPassword, isResetTokenValid } from "@/actions/functions/auth/auth";

export const ResetPasswordContent = () => {
    const t = useTranslations('ResetPasswordPage');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isPending, startTransition] = useTransition();
    
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSuccessAndRedirect = useCallback(() => {
        setIsSuccess(true);
        setTimeout(() => {
            router.replace(PAGE_ENDPOINTS.LOGIN_PAGE);
        }, 2000); // 2 seconds delay
    }, [router]);

    const { resetPasswordSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema: resetPasswordSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                if (!token) {
                    return;
                }
                const result = await resetPassword(token, values.password);
                if (result.success) {
                    toast.success(result.message);
                    handleSuccessAndRedirect();
                } else {
                    toast.error(result.message);
                }
            });
        },
    });

    useEffect(() => {
        async function validateToken() {
            if (!token) {
                router.replace(PAGE_ENDPOINTS.LOGIN_PAGE);
                return;
            }
    
            const result = await isResetTokenValid(token);
    
            if (result.success) {
                setIsValidToken(true);
            } else {
                toast.error(result.message);
                router.push(PAGE_ENDPOINTS.LOGIN_PAGE);
            }
            setIsLoading(false);
        }
    
        validateToken();
    }, [token, router]);

    if (isLoading) {
        return <h1 className='font-bold text-2xl text-center pt-16'>{t('validatingLink')}</h1>;
    }

    if (isSuccess) {
        return <h1 className='font-bold text-green-500 text-2xl text-center pt-16'>{t('resetSuccess')}</h1>;
    }

    if (!isValidToken) {
        return null; // The user will be redirected in the useEffect
    }

    return (
        <section className="flex w-full min-h-screen justify-center">
            <div className="flex flex-col pt-16 items-center space-y-7">
                <h1 className="text-2xl font-bold">{t('resetPassword')}</h1>

                <div className="flex flex-col space-y-10">
                    <ResetPasswordForm
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                    />

                    <Button disabled={isPending} className="w-full font-bold" onClick={handleSubmit}>
                        {isPending ? t('resetting') : t('resetPasswordButton')}
                    </Button>
                </div>
            </div>
        </section>
    );
};