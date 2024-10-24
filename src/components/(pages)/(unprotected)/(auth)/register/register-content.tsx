"use client";

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// HOOKS
import { useForm } from "@/hooks/useForm";

// COMPONENTS
import { Separator } from "@/components/ui/separator";
import { RegisterForm } from "./register-form";
import { toast } from "sonner";

// UTILS
import { registerUser } from "@/actions/functions/auth/auth";

// ZOD
import { registerSchema } from "@/zod/schema";

export const RegisterContent = () => {
    const t = useTranslations('RegisterPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
        initialValues: {
            email: "",
            fullName: "",
            phoneNumber: "",
            gender: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                const result = await registerUser(values);
                if (result.success) {
                    toast.success(result.message);
                    router.replace(PAGE_ENDPOINTS.LOGIN_PAGE);
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

                <div className="flex flex-col space-y-7">
                    <RegisterForm 
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        isPending={isPending}
                    />

                    <div className="flex flex-col items-center space-y-10">
                        <Separator />
                        <p>
                            {t('alreadyUsing')} <Link href={PAGE_ENDPOINTS.LOGIN_PAGE} className="underline">{t('logIn')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};