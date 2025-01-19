// LIBRARIES
import { getTranslations } from "next-intl/server";

// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

// COMPONENTS
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { AccountSettings } from "./account-settings";
import { AppearanceSettings } from "./appearance-settings";
import { NotificationSettings } from "./notification-settings";
//import { SecuritySettings } from "./security-settings";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";

export const SettingsDetails = async () => {
    const [t, locale, serverUserData] = await Promise.all([
        getTranslations("SettingsPage"),
        getUserLocale(),
        getUser() as Promise<typesUser>
    ]);

    return (
        <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="flex flex-wrap justify-start gap-2">
                <TabsTrigger value="account" className="flex-grow sm:flex-grow-0">{t('account')}</TabsTrigger>
                <TabsTrigger value="appearance" className="flex-grow sm:flex-grow-0">{t('appearance')}</TabsTrigger>
                <TabsTrigger value="notifications" className="flex-grow sm:flex-grow-0">{t('notifications')}</TabsTrigger>
                {/*<TabsTrigger value="security" className="flex-grow sm:flex-grow-0">{t('security')}</TabsTrigger>*/}
            </TabsList>

            <TabsContent value="account">
                {/* Client component */}
                <AccountSettings 
                    currentLocale={locale} 
                    currentUserFullName={serverUserData.fullName}
                    currentUserEmail={serverUserData.email}
                />
            </TabsContent>

            <TabsContent value="appearance">
                {/* Client component */}
                <AppearanceSettings />
            </TabsContent>

            <TabsContent value="notifications">
                {/* Client component */}
                <NotificationSettings />
            </TabsContent>

            {/*<TabsContent value="security">
                <SecuritySettings />
            </TabsContent>*/}
        </Tabs>
    )
}