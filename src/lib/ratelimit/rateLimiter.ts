// LIBRARIES
import { redisCacheService } from '@/services/server/redis-cache.service';

// UTILS
import { GenericMessages } from '@/utils/genericMessages';

function getIP(request: Request): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip');
}

const loginThreshold = 5; // 5 requests per minute
const registerThreshold = 3;
const verifyEmailThreshold = 5;
const resetPasswordThreshold = 6;
const addMatchThreshold = 20;
const addDebtThreshold = 50;

export const applyRateLimit = async (request: Request, limitType: 'login' | 'register' | 'verifyEmail' | 'resetPassword' | 'addMatch' | 'addDebt'): Promise<{ success: boolean; message?: string }> => {
    const ip = getIP(request);
    if (!ip) {
        return { success: false, message: GenericMessages.IP_UNKNOWN };
    }

    let threshold: number;
    switch (limitType) {
        case 'login':
            threshold = loginThreshold;
            break;
        case 'register':
            threshold = registerThreshold;
            break;
        case 'verifyEmail':
            threshold = verifyEmailThreshold;
            break;
        case 'resetPassword':
            threshold = resetPasswordThreshold;
            break;
        case 'addMatch':
            threshold = addMatchThreshold;
            break;
        case 'addDebt':
            threshold = addDebtThreshold;
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