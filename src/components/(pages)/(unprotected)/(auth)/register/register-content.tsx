"use client";

// REACTJS IMPORTS
import { useTransition } from "react";

// NEXTJS IMPORTS
import Link from "next/link";
import { useRouter } from "next/navigation";

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { Separator } from "@/components/ui/separator";
import { RegisterForm } from "./register-form";
import { toast } from "sonner";

// HOOKS
import { useForm } from "@/hooks/useForm";
import { useZodSchemas } from "@/hooks/useZodSchema";

// SERVER ACTIONS
import { registerUser } from "@/actions/server_actions/auth/registerUser";

export const RegisterContent = () => {
    const t = useTranslations('RegisterPage');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const { registerSchema } = useZodSchemas();

    const { formData, errors, handleInputChange, handleSubmit } = useForm({
          initialValues: {
            email: "",
            fullName: "",
            phoneNumber: "",
            gender: "",
            country: "",
            player_position: "",
            dni: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
          startTransition(async () => {
            const result = await registerUser(values);
  
            if (result.success) {
              toast.success(result.message);
              router.replace(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE);
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

                <p className="text-red-500 font-semibold mb-4">
                    {t('adminOnlyInfo')}
                </p>

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
                            {t('alreadyUsing')} <Link href={PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE} className="underline">{t('logIn')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};