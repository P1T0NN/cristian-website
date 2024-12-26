"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesUser } from '@/types/typesUser';

const CACHE_TTL = 300; // 5 minutes in seconds

interface UpdateUserFullNameResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface UpdateUserFullNameParams {
    fullName: string;
}

export async function updateUserFullName({ 
    fullName 
}: UpdateUserFullNameParams): Promise<UpdateUserFullNameResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!fullName) {
        return { success: false, message: t('FULL_NAME_REQUIRED') };
    }

    const { data, error: supabaseError } = await supabase
        .from('users')
        .update({ fullName })
        .eq('id', userId)
        .select()
        .single();

    if (supabaseError) {
        return { success: false, message: t('USER_UPDATE_FAILED') };
    }

    // Clear the old cache for this user
    const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;
    await upstashRedisCacheService.delete(cacheKey);

    // Set the new cache with the updated data
    await upstashRedisCacheService.set(cacheKey, data, CACHE_TTL);

    revalidatePath("/");

    return { success: true, message: t('USER_FULL_NAME_UPDATED'), data: data as typesUser };
}