// LIBRARIES
import { createClient } from 'redis';

// UTILS
import { logError, logInfo } from '@/utils/logging/logger';
import { GenericMessages } from '@/utils/genericMessages';

type RedisResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

let redisClient: ReturnType<typeof createClient> | null = null;

async function initializeRedisClient(): Promise<RedisResult<void>> {
    if (!redisClient) {
        redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on('error', (err) => logError('Redis Client', 'REDIS_CLIENT_ERROR', err));

        try {
            await redisClient.connect();
            logInfo('Redis client connected successfully');
            return { success: true };
        } catch (error) {
            logError('initializeRedisClient', 'REDIS_CONNECTION_ERROR', error);
            return { success: false, message: GenericMessages.REDIS_CONNECTION_ERROR };
        }
    }
    return { success: true };
}

export async function getRedisClient(): Promise<RedisResult<ReturnType<typeof createClient>>> {
    const initResult = await initializeRedisClient();
    if (!initResult.success) {
        return { success: false, message: initResult.message };
    }
    return { success: true, data: redisClient! };
}

export async function getFromCache(key: string): Promise<RedisResult<string | null>> {
    const clientResult = await getRedisClient();
    if (!clientResult.success) {
        return { success: false, message: clientResult.message, data: null };
    }
    try {
        const value = await clientResult.data!.get(key);
        return { success: true, data: value };
    } catch (error) {
        logError('getFromCache', 'REDIS_GET_ERROR', error);
        return { success: false, message: GenericMessages.REDIS_GET_ERROR, data: null };
    }
}

export async function setInCache(key: string, value: string, expirationInSeconds: number): Promise<RedisResult<void>> {
    const clientResult = await getRedisClient();
    if (!clientResult.success) {
        return { success: false, message: clientResult.message };
    }
    try {
        await clientResult.data!.set(key, value, { EX: expirationInSeconds });
        return { success: true };
    } catch (error) {
        logError('setInCache', 'REDIS_SET_ERROR', error);
        return { success: false, message: GenericMessages.REDIS_SET_ERROR };
    }
}

export async function deleteFromCache(key: string): Promise<RedisResult<void>> {
    const clientResult = await getRedisClient();
    if (!clientResult.success) {
        return { success: false, message: clientResult.message };
    }
    try {
        await clientResult.data!.del(key);
        return { success: true };
    } catch (error) {
        logError('deleteFromCache', 'REDIS_DELETE_ERROR', error);
        return { success: false, message: GenericMessages.REDIS_DELETE_ERROR };
    }
}

export async function closeRedisConnection(): Promise<RedisResult<void>> {
    if (redisClient) {
        try {
            await redisClient.quit();
            logInfo('Redis connection closed successfully');
            redisClient = null;
            return { success: true };
        } catch (error) {
            logError('closeRedisConnection', 'REDIS_DISCONNECTION_ERROR', error);
            return { success: false, message: GenericMessages.REDIS_DISCONNECTION_ERROR };
        }
    }
    return { success: true };
}

// Handle Redis client closure when the application shuts down
if (typeof process !== 'undefined') {
    process.on('SIGINT', async () => {
        await closeRedisConnection();
        process.exit(0);
    });
}