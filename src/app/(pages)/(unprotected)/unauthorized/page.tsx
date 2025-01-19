"use client"

// REACTJS IMPORTS
import { useEffect } from 'react';

// LIBRARIES
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

// COMPONENTS
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { GoToLoginPageButton } from '@/features/auth/components/unauthorized/go-to-login-page-button';

async function deleteAuthCookies() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response.json();
}

export default function UnauthorizedPage() {
    const t = useTranslations('UnauthorizedPage');

    const { refetch } = useQuery({
        queryKey: ['deleteAuthCookies'],
        queryFn: deleteAuthCookies,
        enabled: false, // This prevents the query from running automatically
    });

    useEffect(() => {
        refetch(); // This will run the query when the component mounts
    }, [refetch]);
  
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
                </CardFooter>
            </Card>
        </div>
    )
}