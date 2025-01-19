// LIBRARIES
import { createClient } from 'redis';

type RedisResult<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

let redisClient: ReturnType<typeof createClient> | null = null;

async function initializeRedisClient(): Promise<RedisResult<void>> {
    if (!redisClient) {
        redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on('error', (err) => console.error('Redis Client Error:', err));

        try {
            await redisClient.connect();
            console.log('Redis client connected successfully');
            return { success: true };
        } catch (error) {
            console.error('Redis Connection Error:', error);
            return { success: false, message: 'Failed to connect to Redis' };
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
        console.error('Redis Get Error:', error);
        return { success: false, message: 'Failed to get data from Redis', data: null };
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
        console.error('Redis Set Error:', error);
        return { success: false, message: 'Failed to set data in Redis' };
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
        console.error('Redis Delete Error:', error);
        return { success: false, message: 'Failed to delete data from Redis' };
    }
}

export async function closeRedisConnection(): Promise<RedisResult<void>> {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log('Redis connection closed successfully');
            redisClient = null;
            return { success: true };
        } catch (error) {
            console.error('Redis Disconnection Error:', error);
            return { success: false, message: 'Failed to close Redis connection' };
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