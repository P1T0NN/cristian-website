// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";

export default async function loading() {
    const t = await getTranslations("AccessForRegistrationPage");

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-4">
                <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>

                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </main>
        </div>
    )
}