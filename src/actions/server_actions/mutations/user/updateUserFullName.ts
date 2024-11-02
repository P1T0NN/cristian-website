"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { serverActionRateLimit } from '@/lib/ratelimit/server_actions/serverActionRateLimit';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

const CACHE_TTL = 300; // 5 minutes in seconds

export async function updateUserFullName(authToken: string, fullName: string) {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await serverActionRateLimit('updateFullName');
    if (!rateLimitResult.success) {
        return { success: false, message: genericMessages('UPDATE_FULL_NAME_RATE_LIMIT') };
    }

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const userId = payload.sub;

    if (!fullName) {
        return { success: false, message: genericMessages('FULL_NAME_REQUIRED') };
    }

    const { data, error: supabaseError } = await supabase
        .from('users')
        .update({ fullName })
        .eq('id', userId)
        .select()
        .single();

    if (supabaseError) {
        return { success: false, message: genericMessages('USER_UPDATE_FAILED') };
    }

    // Clear the old cache for this user
    const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;
    await redisCacheService.delete(cacheKey);

    // Set the new cache with the updated data
    await redisCacheService.set(cacheKey, data, CACHE_TTL);

    revalidatePath("/");

    return { success: true, message: genericMessages('USER_FULL_NAME_UPDATED') };
}