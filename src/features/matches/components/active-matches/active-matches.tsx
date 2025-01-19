// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from './match-card';

// ACTIONS
import { fetchMatches } from '../../actions/fetchMatches';
import { getUser } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesMatch } from '../../types/typesMatch';
import type { typesUser } from '@/features/players/types/typesPlayer';

export const ActiveMatches = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations('HomePage'),
        getUser() as Promise<typesUser>
    ]);

    const serverMatchesData = await fetchMatches({
        isAdmin: currentUserData.isAdmin,
        status: 'active'
    });

    let activeMatches = (serverMatchesData.data || []) as typesMatch[];
    
    // Filter to only show matches where the user is participating
    activeMatches = activeMatches.filter(match => match.isUserInMatch);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('myMatches')}</h2>

            {activeMatches.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noActiveMatches')}
                </div>
            ) : (
                <div className="space-y-4">
                    {activeMatches.map((match) => (
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