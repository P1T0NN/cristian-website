// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from "@/components/(pages)/(protected)/home/match-card";
import { Button } from "@/components/ui/button";

// ACTIONS
import { fetchMatches } from '@/actions/match/fetchMatches';
import { getUser } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesMatch } from '@/types/typesMatch';
import type { typesUser } from '@/types/typesUser';

// LUCIDE ICONS
import { RefreshCcw } from 'lucide-react';

type DisplayMatchesProps = {
    date?: string;
}

export const DisplayMatches = async ({ 
    date
}: DisplayMatchesProps) => {
    const t = await getTranslations("HomePage");

    const serverUserData = await getUser() as typesUser;

    const serverMatchesData = await fetchMatches({
        gender: serverUserData.gender, 
        isAdmin: serverUserData.isAdmin, 
        playerLevel: serverUserData.player_level, 
        userId: serverUserData.id,
        date
    });

    let matchesData: typesMatch[] = [];

    if (serverMatchesData.success && Array.isArray(serverMatchesData.data)) {
        matchesData = serverMatchesData.data;

        // Sort matches by starts_at_hour
        matchesData.sort((a, b) => {
            if (a.starts_at_hour < b.starts_at_hour) return -1;
            if (a.starts_at_hour > b.starts_at_hour) return 1;
            return 0;
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('availableEvents')}</h2>
                <Button variant="ghost" size="sm">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {t('refresh')}
                </Button>
            </div>

            {matchesData.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noEventsAvailable')}
                </div>
            ) : (
                <div className="space-y-4">
                    {matchesData.map((match) => (
                        <MatchCard 
                            key={match.id} 
                            match={match} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
};