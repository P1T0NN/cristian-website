// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from "@/components/(pages)/(protected)/home/match-card";
import { Button } from "@/components/ui/button";

// ACTIONS
import { serverFetchMatches } from '@/actions/functions/data/server/server_fetchMatches';

// TYPES
import type { typesMatch } from '@/types/typesMatch';

// LUCIDE ICONS
import { RefreshCcw } from "lucide-react";

type DisplayMatchesProps = {
    date?: string;
}

export const DisplayMatches = async ({ 
    date
}: DisplayMatchesProps) => {
    const t = await getTranslations("HomePage");

    const serverMatchesData = await serverFetchMatches(date);
    const matchesData = serverMatchesData.data as typesMatch[];

    async function refreshMatches() {
        'use server'
        revalidatePath('/');
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('availableEvents')}</h2>
                <form action={refreshMatches}>
                    <Button variant="ghost" size="sm" type="submit">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        {t('refresh')}
                    </Button>
                </form>
            </div>

            {matchesData.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noEventsAvailable')}
                </div>
            ) : (
                <div className="space-y-4">
                    {matchesData.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    );
};