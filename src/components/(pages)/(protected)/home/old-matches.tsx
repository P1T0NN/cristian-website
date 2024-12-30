// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from "@/components/(pages)/(protected)/home/match-card";

// ACTIONS
import { getUser } from '@/actions/auth/verifyAuth';
import { fetchMatches } from '@/actions/match/fetchMatches';

// TYPES
import type { typesMatch } from '@/types/typesMatch';
import type { typesUser } from '@/types/typesUser';

export const OldMatches = async () => {
    const t = await getTranslations("HomePage");

    const currentUserData = await getUser() as typesUser;
    
    const serverOldMatchesData = await fetchMatches({
        userId: currentUserData.id,
        isAdmin: currentUserData.isAdmin,
        includeOldMatches: true
    });
    const oldMatchesData = serverOldMatchesData.data as typesMatch[];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('pastEvents')}</h2>

            {oldMatchesData.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noPastEventsAvailable')}
                </div>
            ) : (
                <div className="space-y-4">
                    {oldMatchesData.map((match) => (
                        <MatchCard 
                            key={match.id} 
                            match={match} 
                        />
                    ))}
                </div>
            )}
        </div>
    )
}