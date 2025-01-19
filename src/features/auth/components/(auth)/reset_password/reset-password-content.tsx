'use client';

// REACTJS IMPORTS
import { useState, useEffect } from 'react';

// NEXTJS IMPORTS
import { useRouter, useSearchParams } from 'next/navigation';

// LIBRARIES
import { useTranslations } from 'next-intl';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { toast } from "sonner";
import { ResetPasswordForm } from "./reset-password-form";
import { Button } from "@/shared/components/ui/button";

// HOOKS
import { useForm } from "@/shared/hooks/useForm";
import { useZodSchemas } from "@/shared/hooks/useZodSchema";

// SERVER ACTIONS
import { resetPassword } from '@/features/auth/actions/server_actions/resetPassword';
import { validateResetToken } from '@/features/auth/actions/server_actions/validateResetToken';

export function ResetPasswordContent() {
  const t = useTranslations('ResetPasswordPage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'resetting' | 'success' | 'error'>('validating');
  const [message, setMessage] = useState('');

  const { resetPasswordSchema } = useZodSchemas();

  const { formData, errors, handleInputChange, handleSubmit } = useForm({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!token) return;

      setStatus('resetting');

      const result = await resetPassword(token, values.password);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        toast.success(result.message);
        setTimeout(() => router.replace(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE), 3000);
      } else {
        setStatus('error');
        setMessage(result.message);
        toast.error(result.message);
      }
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE);
      return;
    }

    const validateToken = async () => {
      const result = await validateResetToken(token);
      if (result.success) {
        setStatus('valid');
      } else {
        setStatus('invalid');
        setMessage(result.message);
        toast.error(result.message);
        setTimeout(() => router.replace(PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE), 3000);
      }
    };

    validateToken();
  }, [token, router]);

  if (status === 'validating') {
    return <h1 className='font-bold text-2xl text-center pt-16'>{t('validatingLink')}</h1>;
  }

  if (status === 'invalid' || status === 'error') {
    return <h1 className='font-bold text-red-500 text-2xl text-center pt-16'>{message}</h1>;
  }

  if (status === 'success') {
    return <h1 className='font-bold text-green-500 text-2xl text-center pt-16'>{t('resetSuccess')}</h1>;
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

          <Button disabled={status === 'resetting'} className="w-full font-bold" onClick={handleSubmit}>
            {status === 'resetting' ? t('resetting') : t('resetPasswordButton')}
          </Button>
        </div>
      </div>
    </section>
  );
}