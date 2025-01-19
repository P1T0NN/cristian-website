"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesLocation } from '../../types/typesLocation';

interface MarkAsDefaultLocationResponse {
    success: boolean;
    message: string;
    data?: typesLocation;
}

interface MarkAsDefaultLocationParams {
    locationId: number;
    isDefault: boolean;
}

export async function markAsDefaultLocation({ 
    locationId, 
    isDefault 
}: MarkAsDefaultLocationParams): Promise<MarkAsDefaultLocationResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!locationId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Update the specified location
    const { data, error } = await supabase
        .from('locations')
        .update({ is_default: isDefault })
        .eq('id', locationId)
        .select()
        .single();

    if (error) {
        return { success: false, message: isDefault ? t('DEFAULT_LOCATION_SET_FAILED') : t('DEFAULT_LOCATION_UNSET_FAILED') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);
    await upstashRedisCacheService.delete(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY);

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { 
        success: true, 
        message: isDefault ? t('DEFAULT_LOCATION_SET') : t('DEFAULT_LOCATION_UNSET'), 
        data: data as typesLocation 
    };
}