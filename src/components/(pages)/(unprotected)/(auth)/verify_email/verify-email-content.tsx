'use client';

// REACTJS IMPORTS
import { useState, useEffect } from 'react';

// NEXTJS IMPORTS
import { useRouter } from 'next/navigation';

// LIBRARIES
import { useTranslations } from 'next-intl';

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

// SERVER ACTIONS
import { verifyEmail } from '@/actions/server_actions/auth/verifyEmail';

export const VerifyEmailContent = ({ 
  token 
}: { 
  token: string 
}) => {
  const t = useTranslations("VerifyEmailPage");
  const router = useRouter();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerifyEmail = async () => {
      const result = await verifyEmail(token);

      setStatus(result.success ? 'success' : 'error');
      setMessage(result.message);

      if (result.success) {
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleVerifyEmail();
  }, [token, router]);

  const handleReturn = () => {
    router.push('/');
  };

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'verifying' && (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <p>{t('verifying')}</p>
          </div>
        )}
        {status === 'success' && (
          <>
            <p className="text-green-600 mb-4">{message}</p>
            <p className="mb-4">{t('redirecting')}</p>
            <Button onClick={handleReturn} className="w-full">{t('returnHome')}</Button>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 mb-4">{message}</p>
            <Button onClick={handleReturn} className="w-full">{t('returnHome')}</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}