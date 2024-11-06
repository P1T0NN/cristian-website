// NEXTJS IMPORTS
import { headers } from "next/headers";

// LIBRARIES
import { redisCacheService } from '@/services/server/redis-cache.service';

// UTILS
import { GenericMessages } from '@/utils/genericMessages';

const editMatchInstructions = 30;
const switchTeamColorThreshold = 30;
const addDebtThreshold = 50;
const deleteDebtThreshold = 50;
const updateFullNameThreshold = 5;
const deleteLocationThreshold = 10;
const addLocationThreshold = 10;
const addMatchThreshold = 20;
const deleteMatchThreshold = 50;
const editMatchThreshold = 20;
const addTeamThreshold = 20;
const deleteTeamThreshold = 20;
const searchBarThreshold = 150;
const addTeamDebtThreshold = 30;

async function getIP(): Promise<string | null> {
    const awaitedHeaders = await headers();

    const forwarded = awaitedHeaders.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0] : awaitedHeaders.get('x-real-ip');
}

export const serverActionRateLimit = async (
    limitType: 
        'editMatchInstructions' |
        'switchTeamColor' |
        'addDebt' |
        'deleteDebt' |
        'updateFullName' |
        'deleteLocation' |
        'addLocation' |
        'addMatch' |
        'deleteMatch' |
        'editMatch' |
        'addTeam' |
        'deleteTeam' |
        'searchBar' |
        'addTeamDebt'
): Promise<{ success: boolean; message?: string }> => {
    const ip = getIP();
    if (!ip) {
        return { success: false, message: GenericMessages.IP_UNKNOWN };
    }

    let threshold: number;
    switch (limitType) {
        case 'editMatchInstructions':
            threshold = editMatchInstructions;
            break;
        case 'switchTeamColor':
            threshold = switchTeamColorThreshold;
            break;
        case 'addDebt':
            threshold = addDebtThreshold;
            break;
        case 'deleteDebt':
            threshold = deleteDebtThreshold;
            break;
        case 'updateFullName':
            threshold = updateFullNameThreshold;
            break;
        case 'deleteLocation':
            threshold = deleteLocationThreshold;
            break;
        case 'addLocation':
            threshold = addLocationThreshold;
            break;
        case 'addMatch':
            threshold = addMatchThreshold;
            break;
        case 'deleteMatch':
            threshold = deleteMatchThreshold;
            break;
        case 'editMatch':
            threshold = editMatchThreshold;
            break;
        case 'addTeam':
            threshold = addTeamThreshold;
            break;
        case 'deleteTeam':
            threshold = deleteTeamThreshold;
            break;
        case 'searchBar':
            threshold = searchBarThreshold;
            break;
        case 'addTeamDebt':
            threshold = addTeamDebtThreshold;
            break;
        default:
            return { success: false, message: 'Invalid limit type' };
    }

    const key = `rateLimit:${limitType}:${ip}`;

    const currentCountResult = await redisCacheService.get<number>(key);
    const currentCount = currentCountResult.data ?? 0;

    const newCount = currentCount + 1;

    if (newCount > threshold) {
        return { success: false, message: GenericMessages.RATE_LIMIT_EXCEEDED };
    }

    // Update count in Redis and reset TTL to 60 seconds
    await redisCacheService.set(key, newCount, 60);
    return { success: true };
};