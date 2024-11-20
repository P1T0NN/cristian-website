// LIBRARIES
import { Redis } from '@upstash/redis';

// TYPES
import { RateLimiter, UpstashConfig, RateLimitResult } from '@/types/auth/typesRateLimit';

export class UpstashRateLimiter implements RateLimiter {
    private redis: Redis;
  
    constructor(private config: UpstashConfig) {
        this.redis = new Redis({
            url: config.url,
            token: config.token,
        });
    }
  
    async limit(key: string): Promise<RateLimitResult> {
        const { points, duration, blockDuration } = this.config;
        const now = Date.now();
        const windowKey = `${key}:${Math.floor(now / duration)}`;
        const blockKey = `${key}:blocked`;
    
        const multi = this.redis.multi();
        multi.incr(windowKey);
        multi.expire(windowKey, Math.ceil(duration / 1000)); // Convert ms to seconds
        multi.ttl(blockKey);
        const results = await multi.exec();
    
        if (!results || results.length !== 3) {
            throw new Error('Unexpected response from Redis');
        }
    
        const [count, , blockTtl] = results;
    
        if (typeof count !== 'number') {
            throw new Error('Unexpected count value from Redis');
        }
    
        if (typeof blockTtl === 'number' && blockTtl > 0) {
            return {
                success: false,
                limit: points,
                remaining: 0,
                reset: now + blockTtl * 1000
            };
        }
    
        const isRateLimited = count >= points;
        const reset = Math.ceil(now / duration) * duration;
    
        if (isRateLimited) {
            await this.redis.set(blockKey, '1', { ex: Math.ceil(blockDuration / 1000) });
        }
    
        return {
            success: !isRateLimited,
            limit: points,
            remaining: Math.max(points - count, 0),
            reset: reset
        };
    }
}