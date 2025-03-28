// LIBRARIES
import { getTranslations } from "next-intl/server";

// COMPONENTS
import { DisplayMatchHistory } from "@/features/matches/components/match-history/display-match-history";

export default async function MatchHistoryPage() {
    const t = await getTranslations("MatchHistoryPage");

    return (
        <section className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">{t('matchHistory')}</h1>

            {/* NO need for individual Suspense here, since we fetch in one component two calls, loading.tsx is sufficient! */}
            <DisplayMatchHistory />
        </section>
    );
}