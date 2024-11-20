// REACTJS IMPORTS
import { Suspense } from 'react';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { VerifyEmailContent } from '@/components/(pages)/(unprotected)/(auth)/verify_email/verify-email-content';

export default async function VerifyEmailPage({
  searchParams,
}: {
    searchParams: Promise<{ token: string }> 
}) {
    const t = await getTranslations('VerifyEmailPage');
    const { token } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      <Suspense fallback={<p>{t('verifying')}</p>}>
        <VerifyEmailContent token={token} />
      </Suspense>
    </main>
  );
}