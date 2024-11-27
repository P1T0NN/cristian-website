"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

export async function markAsDefaultLocation(authToken: string, locationId: number, isDefault: boolean) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    // If setting as default, first unset any existing default location
    if (isDefault) {
        const { error: resetError } = await supabase
            .from('locations')
            .update({ is_default: false })
            .eq('is_default', true);

        if (resetError) {
            return { success: false, message: t('DEFAULT_LOCATION_RESET_FAILED') };
        }
    }

    // Update the specified location
    const { data, error } = await supabase
        .from('locations')
        .update({ is_default: isDefault })
        .eq('id', locationId);

    if (error) {
        return { success: false, message: isDefault ? t('DEFAULT_LOCATION_SET_FAILED') : t('DEFAULT_LOCATION_UNSET_FAILED') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);

    revalidatePath("/");

    return { success: true, message: isDefault ? t('DEFAULT_LOCATION_SET') : t('DEFAULT_LOCATION_UNSET'), data };
}