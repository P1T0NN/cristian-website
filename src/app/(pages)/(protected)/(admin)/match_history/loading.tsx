// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { Skeleton } from "@/shared/components/ui/skeleton";

export default async function loading() {
    const t = await getTranslations("MatchHistoryPage");

    return (
        <section className="container mx-auto p-4 space-y-6">
             <h1 className="text-2xl font-bold">{t('matchHistory')}</h1>

            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="w-full h-[180px] rounded-lg" /> // Match card skeleton
                ))}
            </div>

            <div className="flex justify-center mt-4">
                <Skeleton className="h-10 w-96" /> {/* Pagination skeleton */}
            </div>
        </section>
    )
}