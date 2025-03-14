// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from './match-card';

// ACTIONS
import { fetchMatches } from '../../actions/fetchMatches';
import { getUser } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesUser } from '@/features/players/types/typesPlayer';
import type { typesMatch } from '../../types/typesMatch';

interface FetchMatchesParams {
    gender?: string;
    isAdmin?: boolean;
    playerLevel?: string;
    date?: string;
    status?: "active" | "pending" | "finished";
    isPastMatches?: boolean;
    currentDate?: string;
    currentTime?: string;
    currentUserId?: string;
    filterByUserId?: boolean;
}

export const ActiveMatches = async () => {
    const [t, currentUserData] = await Promise.all([
        getTranslations('HomePage'),
        getUser() as Promise<typesUser>
    ]);
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`; // Format: HH:MM
    
    const fetchParams = {
        isAdmin: currentUserData.isAdmin,
        status: 'active',
        currentUserId: currentUserData.id,
        filterByUserId: true,
        playerLevel: currentUserData.playerLevel,
        currentDate: currentDate,
        currentTime: currentTime
    };
    
    const serverMatchesData = await fetchMatches(fetchParams as FetchMatchesParams);
    
    // Additional client-side filtering to ensure we only show future matches
    const futureMatches = serverMatchesData.data?.filter(match => {
        // Skip matches in the past
        if (match.startsAtDay < currentDate) return false;
        if (match.startsAtDay === currentDate && match.startsAtHour < currentTime) return false;
        return true;
    }) || [];
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('myMatches')}</h2>

            {futureMatches.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noActiveMatches')}
                </div>
            ) : (
                <div className="space-y-4">
                    {futureMatches.map((match: typesMatch) => (
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