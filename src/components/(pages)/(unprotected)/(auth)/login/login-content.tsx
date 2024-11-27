"use client"

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS, PUBLIC_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { LoginForm } from "./login-form";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER ACTIONS
import { loginUser } from "@/actions/server_actions/auth/loginUser";

// TYPES
import { typesLoginForm } from "@/types/forms/LoginForm";

export const LoginContent = () => {
    const t = useTranslations('LoginPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    
    const { loginSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm<typesLoginForm>({
        initialValues: { email: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await loginUser(values.email, values.password);

                if (result.success) {
                    toast.success(result.message);
                    router.replace(PROTECTED_PAGE_ENDPOINTS.HOME_PAGE);
                } else {
                    toast.error(result.message);
                }
            });
        },
    });
    
    return (
        <section className="flex w-full min-h-screen justify-center">
            <div className="flex flex-col pt-16 items-center space-y-7">
                <h1 className="text-2xl font-bold">{t('title')}</h1>

                <div className="flex flex-col space-y-10">
                    <LoginForm
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                    />

                    <div className="flex items-center justify-between">
                        <Link href={PUBLIC_PAGE_ENDPOINTS.FORGOT_PASSWORD_PAGE} className="underline">
                            {t('forgotPassword')}
                        </Link>

                        <Button disabled={isPending} className="w-[150px] font-bold" onClick={handleSubmit}>
                            {isPending ? t('loggingIn') : t('logIn')}
                        </Button>
                    </div>

                    <div className="flex flex-col items-center space-y-10">
                        <Separator />
                        <p>
                            {t('notAMember')} <Link href={PUBLIC_PAGE_ENDPOINTS.REGISTER_PAGE} className="underline">{t('register')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};