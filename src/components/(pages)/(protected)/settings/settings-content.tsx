"use client"

// LIBRARIES
import { useTranslations, useLocale } from 'next-intl';

// COMPONENTS
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from './account-settings';
import { AppearanceSettings } from './appearance-settings';
import { SecuritySettings } from './security-settings';
import { NotificationSettings } from './notification-settings';

// TYPES
import type { typesUser } from '@/types/typesUser';

type SettingsContentProps = {
    serverUserData: typesUser;
    authToken: string;
}

export const SettingsContent = ({
    serverUserData,
    authToken
}: SettingsContentProps) => {
    const t = useTranslations('SettingsPage');
    const locale = useLocale();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
            
            <Tabs defaultValue="account" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="account">{t('account')}</TabsTrigger>
                    <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
                    <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
                    <TabsTrigger value="security">{t('security')}</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <AccountSettings 
                        serverUserData={serverUserData} 
                        authToken={authToken} 
                        currentLocale={locale} 
                    />
                </TabsContent>

                <TabsContent value="appearance">
                    <AppearanceSettings />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="security">
                    <SecuritySettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}