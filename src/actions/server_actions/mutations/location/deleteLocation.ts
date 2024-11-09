"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

export async function deleteLocation(authToken: string, locationId: number) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    if (!locationId) {
        return { success: false, message: t('LOCATION_ID_REQUIRED') };
    }

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

    if (error) {
        return { success: false, message: t('LOCATION_DELETION_FAILED') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);

    revalidatePath("/");

    return { success: true, message: t('LOCATION_DELETED') };
}