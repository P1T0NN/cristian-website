// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { GoToLoginPageButton } from '@/features/auth/components/unauthorized/go-to-login-page-button';
import { GoToNewUserPage } from '@/features/auth/components/unauthorized/go-to-new-user-page';

// ACTIONS
import { checkUserAccess } from '@/features/auth/actions/verifyAuth';

export default async function UnauthorizedPage() {
    const t = await getTranslations('UnauthorizedPage');

    const { country } = await checkUserAccess();
  
    return (
        <div className="flex items-center justify-center bg-background p-4 overflow-hidden">
            <Card className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p>{t('explanation')}</p>
                    <ul className="list-disc list-inside text-left">
                        <li>{t('pending')}</li>
                        <li>{t('restricted')}</li>
                        <li>{t('permissions')}</li>
                    </ul>
                </CardContent>

                <CardFooter className="flex justify-center space-x-4">
                    <GoToLoginPageButton />

                    {!country && <GoToNewUserPage />}
                </CardFooter>
            </Card>
        </div>
    )
}