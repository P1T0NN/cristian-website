"use server"

// NEXTJS IMPORTS
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

const COOLDOWN_DURATION = 300; // 5 minutes in seconds

export async function checkLoginRateLimit(email: string): Promise<{ isOnCooldown: boolean; remainingTime?: number }> {
    const cooldownKey = `login_cooldown:${email}`;
    const cachedCooldown = await upstashRedisCacheService.get<number>(cooldownKey);

    if (cachedCooldown.success && cachedCooldown.data) {
        const remainingTime = cachedCooldown.data - Date.now();
        if (remainingTime > 0) {
            return { isOnCooldown: true, remainingTime };
        }
    }

    // If we reach here, either there's no cooldown or it's expired
    // Set the new cooldown expiry time
    const expiryTime = Date.now() + (COOLDOWN_DURATION * 1000);
    await upstashRedisCacheService.set(cooldownKey, expiryTime, COOLDOWN_DURATION);
    
    return { isOnCooldown: false };
}