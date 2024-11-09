// LIBRARIES
import { Redis } from '@upstash/redis'

// UTILS
import { logError, logInfo } from '@/utils/logging/logger'
import { GenericMessages } from '@/utils/genericMessages'

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
        logInfo('Upstash Redis client initialized successfully');
    }

    // Note: Upstash Redis doesn't require explicit connect/disconnect
    private checkConnection(): CacheResult<void> {
        if (!this.isInitialized) {
            logError('UpstashRedisCacheService', 'REDIS_CLIENT_ERROR', 'Client not initialized');
            return { success: false, message: GenericMessages.REDIS_CONNECTION_ERROR };
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
            logError('UpstashRedisCacheService.get', 'REDIS_GET_ERROR', error);
            return { 
                success: false, 
                message: GenericMessages.REDIS_GET_ERROR, 
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
            logError('UpstashRedisCacheService.set', 'REDIS_SET_ERROR', error);
            return { 
                success: false, 
                message: GenericMessages.REDIS_SET_ERROR 
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
            logError('UpstashRedisCacheService.delete', 'REDIS_DELETE_ERROR', error);
            return { 
                success: false, 
                message: GenericMessages.REDIS_DELETE_ERROR 
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
            logError('UpstashRedisCacheService.increment', 'REDIS_INCREMENT_ERROR', error);
            return { 
                success: false, 
                message: GenericMessages.REDIS_OPERATION_ERROR 
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
            logError('UpstashRedisCacheService.exists', 'REDIS_EXISTS_ERROR', error);
            return { 
                success: false, 
                message: GenericMessages.REDIS_OPERATION_ERROR 
            };
        }
    }
}

export const upstashRedisCacheService = new UpstashRedisCacheService();