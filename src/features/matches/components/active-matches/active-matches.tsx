// LIBRARIES
import { getTranslations } from 'next-intl/server';

// COMPONENTS
import { MatchCard } from './match-card';

// ACTIONS
import { fetchMatches } from '../../actions/fetchMatches';
import { getUser } from '@/features/auth/actions/verifyAuth';

// UTILS
import { getCurrentDateTimeStrings, getDateDaysAgo } from '@/shared/utils/dateUtils';

// TYPES
import type { typesUser } from '@/features/players/types/typesPlayer';
import type { typesMatch } from '../../types/typesMatch';

interface FetchMatchesParams {
    gender?: string;
    isAdmin?: boolean;
    playerLevel?: string;
    date?: string;
    status?: "active" | "pending" | "finished" | "cancelled";
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
    
    // Get current date and time using utility function
    const { currentDate, currentTime } = getCurrentDateTimeStrings();
    
    // Fetch both active and cancelled matches where the user is participating
    const [activeMatches, cancelledMatches] = await Promise.all([
        fetchMatches({
            isAdmin: currentUserData.isAdmin,
            status: 'active',
            currentUserId: currentUserData.id,
            filterByUserId: true,
            playerLevel: currentUserData.playerLevel,
            currentDate,
            currentTime
        } as FetchMatchesParams),
        
        fetchMatches({
            isAdmin: currentUserData.isAdmin,
            status: 'cancelled',
            currentUserId: currentUserData.id,
            filterByUserId: true,
            playerLevel: currentUserData.playerLevel
        } as FetchMatchesParams)
    ]);
    
    // Additional client-side filtering to ensure we only show future matches and recent cancelled matches
    const futureActiveMatches = activeMatches.data?.filter(match => {
        // Skip matches in the past
        if (match.startsAtDay < currentDate) return false;
        if (match.startsAtDay === currentDate && match.startsAtHour < currentTime) return false;
        return true;
    }) || [];
    
    // For cancelled matches, show recent ones (from last 7 days and future)
    const sevenDaysAgoStr = getDateDaysAgo(7);
    
    const relevantCancelledMatches = cancelledMatches.data?.filter(match => {
        return match.startsAtDay >= sevenDaysAgoStr;
    }) || [];
    
    // Combine both match types and sort by date (closest first)
    const allUserMatches = [...futureActiveMatches, ...relevantCancelledMatches].sort((a, b) => {
        const dateA = new Date(`${a.startsAtDay}T${a.startsAtHour}`);
        const dateB = new Date(`${b.startsAtDay}T${b.startsAtHour}`);
        return dateA.getTime() - dateB.getTime(); // Ascending (closest date first)
    });
    
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t('myMatches')}</h2>

            {allUserMatches.length === 0 ? (
                <div className="text-center text-muted-foreground">
                    {t('noActiveMatches')}
                </div>
            ) : (
                <div className="space-y-4">
                    {allUserMatches.map((match: typesMatch) => (
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