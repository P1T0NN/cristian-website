"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { PAGE_ENDPOINTS } from "@/config"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LoginForm } from "./login-form"
import { useForm } from "@/hooks/useForm"
import { useZodSchemas } from "@/hooks/useZodSchema"
import { loginUser } from "@/actions/functions/auth/auth"
import type { typesLoginForm } from "@/types/forms/LoginForm"

export const LoginContent = () => {
    const t = useTranslations('LoginPage')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const { loginSchema } = useZodSchemas()

    const { formData, errors, handleInputChange, handleSubmit } = useForm<typesLoginForm>({
        initialValues: { email: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            startTransition(async () => {
                try {
                    const result = await loginUser(values)
                    if (result.success) {
                        toast.success(result.message)
                        router.replace(PAGE_ENDPOINTS.HOME_PAGE)
                    } else {
                        toast.error(result.message)
                    }
                } catch (error) {
                    console.error('Login error:', error)
                    toast.error(t('loginError'))
                }
            })
        },
    })
    
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
                        <Link href={PAGE_ENDPOINTS.FORGOT_PASSWORD_PAGE} className="underline">
                            {t('forgotPassword')}
                        </Link>

                        <Button 
                            disabled={isPending} 
                            className="w-[150px] font-bold" 
                            onClick={handleSubmit}
                            aria-busy={isPending}
                        >
                            {isPending ? t('loggingIn') : t('logIn')}
                        </Button>
                    </div>

                    <div className="flex flex-col items-center space-y-10">
                        <Separator />
                        <p>
                            {t('notAMember')} <Link href={PAGE_ENDPOINTS.REGISTER_PAGE} className="underline">{t('register')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}