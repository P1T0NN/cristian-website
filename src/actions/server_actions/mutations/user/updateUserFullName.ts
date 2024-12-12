"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

const CACHE_TTL = 300; // 5 minutes in seconds

export async function updateUserFullName(authToken: string, fullName: string) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

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
    await upstashRedisCacheService.delete(cacheKey);

    // Set the new cache with the updated data
    await upstashRedisCacheService.set(cacheKey, data, CACHE_TTL);

    revalidatePath("/");

    return { success: true, message: genericMessages('USER_FULL_NAME_UPDATED') };
}