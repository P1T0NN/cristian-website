// LIBRARIES
import { Redis } from '@upstash/redis'

type CacheResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

class UpstashRedisCacheService {
    private client: Redis;
    private isInitialized: boolean = false;

    constructor() {
        // Upstash Redis client is initialized differently - no connection handling needed
        this.client = new Redis({
            url: process.env.REDIS_URL!,
            token: process.env.REDIS_TOKEN!, // If using Redis Cloud, you might not need this
            automaticDeserialization: true,
        });
        this.isInitialized = true;
        console.log('Upstash Redis client initialized successfully');
    }

    // Note: Upstash Redis doesn't require explicit connect/disconnect
    private checkConnection(): CacheResult<void> {
        if (!this.isInitialized) {
            console.error('UpstashRedisCacheService: Client not initialized');
            return { success: false, message: 'Failed to connect to Redis' };
        }
        return { success: true };
    }

    async get<T>(key: string): Promise<CacheResult<T | null>> {
        const connectionCheck = this.checkConnection();
        if (!connectionCheck.success) {
            return { success: false, message: connectionCheck.message, data: null };
        }

        try {
            const value = await this.client.get<T>(key);
            return { 
                success: true, 
                data: value ?? null 
            };
        } catch (error) {
            console.error('UpstashRedisCacheService.get Error:', error);
            return { 
                success: false, 
                message: 'Failed to get data from Redis', 
                data: null 
            };
        }
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<CacheResult<void>> {
        const connectionCheck = this.checkConnection();
        if (!connectionCheck.success) {
            return { success: false, message: connectionCheck.message };
        }

        try {
            // Upstash Redis handles serialization automatically
            await this.client.set(key, value, {
                ex: ttlSeconds
            });
            return { success: true };
        } catch (error) {
            console.error('UpstashRedisCacheService.set Error:', error);
            return { 
                success: false, 
                message: 'Failed to set data in Redis' 
            };
        }
    }

    async delete(key: string): Promise<CacheResult<void>> {
        const connectionCheck = this.checkConnection();
        if (!connectionCheck.success) {
            return { success: false, message: connectionCheck.message };
        }

        try {
            await this.client.del(key);
            return { success: true };
        } catch (error) {
            console.error('UpstashRedisCacheService.delete Error:', error);
            return { 
                success: false, 
                message: 'Failed to delete data from Redis' 
            };
        }
    }

    // Additional methods that Upstash Redis provides

    async increment(key: string): Promise<CacheResult<number>> {
        const connectionCheck = this.checkConnection();
        if (!connectionCheck.success) {
            return { success: false, message: connectionCheck.message };
        }

        try {
            const newValue = await this.client.incr(key);
            return { 
                success: true, 
                data: newValue 
            };
        } catch (error) {
            console.error('UpstashRedisCacheService.increment Error:', error);
            return { 
                success: false, 
                message: 'Failed to increment value in Redis' 
            };
        }
    }

    async exists(key: string): Promise<CacheResult<boolean>> {
        const connectionCheck = this.checkConnection();
        if (!connectionCheck.success) {
            return { success: false, message: connectionCheck.message };
        }

        try {
            const exists = await this.client.exists(key);
            return { 
                success: true, 
                data: exists === 1 
            };
        } catch (error) {
            console.error('UpstashRedisCacheService.exists Error:', error);
            return { 
                success: false, 
                message: 'Failed to check key existence in Redis' 
            };
        }
    }
}

export const upstashRedisCacheService = new UpstashRedisCacheService();