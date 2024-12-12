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

export async function markAsDefaultLocation(authToken: string, locationId: number, isDefault: boolean) {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
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