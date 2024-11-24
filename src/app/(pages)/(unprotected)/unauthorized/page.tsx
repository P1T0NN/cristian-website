// NEXTJS IMPORTS
import Link from 'next/link';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from '@/config';

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UnauthorizedPage() {
    const t = await getTranslations('UnauthorizedPage');
  
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
                    <Button asChild variant="outline">
                        <Link href={PUBLIC_PAGE_ENDPOINTS.LOGIN_PAGE}>{t('goToHomepage')}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}