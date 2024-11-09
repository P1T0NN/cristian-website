"use server"

// LIBRARIES
import { upstashRedisCacheService } from "@/services/server/redis-cache.service";

// CONFIG
import { GLOBAL_RATE_LIMIT } from "@/config";

export async function checkGlobalRateLimit(identifier: string): Promise<boolean> {
    const key = `globalRateLimit:${identifier}`;
    
    // First, check if the key exists
    const existsResult = await upstashRedisCacheService.exists(key);
    
    if (!existsResult.success) {
        // If there's an error checking existence, fail open (return true) or handle error
        return true;
    }
    
    if (!existsResult.data) {
        const setResult = await upstashRedisCacheService.set(key, 1, 3600);
        return setResult.success; // Return true if set was successful
    }

    // Increment the counter
    const incrementResult = await upstashRedisCacheService.increment(key);
    
    if (!incrementResult.success || !incrementResult.data) {
        // Handle increment error
        return false;
    }

    // Check if we're over the limit
    if (incrementResult.data > GLOBAL_RATE_LIMIT) {
        return false;
    }

    return true;
}