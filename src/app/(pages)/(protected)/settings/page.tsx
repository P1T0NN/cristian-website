// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { SettingsDetails } from "@/components/(pages)/(protected)/settings/settings-details";

export default async function SettingsPage() {
    const t = await getTranslations("SettingsPage");

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">{t('title')}</h1>
            
            <SettingsDetails />
        </div>
    )
}