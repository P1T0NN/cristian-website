// NEXTJS IMPORTS
import { cookies } from "next/headers";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// SERVICES
import { getUserLocale } from "@/services/server/locale";

// COMPONENTS
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { AppearanceSettings } from "./appearance-settings";
import { NotificationSettings } from "./notification-settings";
import { SecuritySettings } from "./security-settings";

// ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

export const SettingsDetails = async () => {
    const t = await getTranslations("SettingsPage");
    const locale = await getUserLocale();

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await getUser() as typesUser;

    return (
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
    )
}