"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function updateDefaultPrice(authToken: string, locationId: number, defaultPrice: string): Promise<APIResponse> {
    const t = await getTranslations('GenericMessages');

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { error } = await supabase
        .from('locations')
        .update({ default_price: defaultPrice })
        .eq('id', locationId);

    if (error) {
        return { success: false, message: t('DEFAULT_PRICE_UPDATE_ERROR') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);
    await upstashRedisCacheService.delete(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY);

    revalidatePath("/");

    return { success: true, message: t('DEFAULT_PRICE_UPDATED') };
}