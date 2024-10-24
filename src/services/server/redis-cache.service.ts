// LIBRARIES
import { createClient } from 'redis';

// UTILS
import { logError, logInfo } from '@/utils/logging/logger';
import { GenericMessages } from '@/utils/genericMessages';

type CacheResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

class RedisCacheService {
    private client: ReturnType<typeof createClient>;

    constructor() {
        this.client = createClient({ url: process.env.REDIS_URL });
        this.client.on('error', (err) => logError('RedisCacheService', 'REDIS_CLIENT_ERROR', err));
    }

    async connect(): Promise<CacheResult<void>> {
        if (!this.client.isOpen) {
            try {
                await this.client.connect();
                logInfo('Redis client connected successfully');
                return { success: true };
            } catch (error) {
                logError('RedisCacheService.connect', 'REDIS_CONNECTION_ERROR', error);
                return { success: false, message: GenericMessages.REDIS_CONNECTION_ERROR };
            }
        }
        return { success: true };
    }

    async disconnect(): Promise<CacheResult<void>> {
        if (this.client.isOpen) {
            try {
                await this.client.disconnect();
                logInfo('Redis client disconnected successfully');
                return { success: true };
            } catch (error) {
                logError('RedisCacheService.disconnect', 'REDIS_DISCONNECTION_ERROR', error);
                return { success: false, message: GenericMessages.REDIS_DISCONNECTION_ERROR };
            }
        }
        return { success: true };
    }

    async get<T>(key: string): Promise<CacheResult<T | null>> {
        try {
            const connectResult = await this.connect();
            if (!connectResult.success) {
                return { success: false, message: connectResult.message, data: null };
            }
            const value = await this.client.get(key);
            return { success: true, data: value ? JSON.parse(value) : null };
        } catch (error) {
            logError('RedisCacheService.get', 'REDIS_GET_ERROR', error);
            return { success: false, message: GenericMessages.REDIS_GET_ERROR, data: null };
        }
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<CacheResult<void>> {
        try {
            const connectResult = await this.connect();
            if (!connectResult.success) {
                return { success: false, message: connectResult.message };
            }
            await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
            return { success: true };
        } catch (error) {
            logError('RedisCacheService.set', 'REDIS_SET_ERROR', error);
            return { success: false, message: GenericMessages.REDIS_SET_ERROR };
        }
    }

    async delete(key: string): Promise<CacheResult<void>> {
        try {
            const connectResult = await this.connect();
            if (!connectResult.success) {
                return { success: false, message: connectResult.message };
            }
            await this.client.del(key);
            return { success: true };
        } catch (error) {
            logError('RedisCacheService.delete', 'REDIS_DELETE_ERROR', error);
            return { success: false, message: GenericMessages.REDIS_DELETE_ERROR };
        }
    }
}

export const redisCacheService = new RedisCacheService();