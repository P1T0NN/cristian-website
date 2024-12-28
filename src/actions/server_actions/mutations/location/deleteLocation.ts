"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

interface DeleteLocationResponse {
    success: boolean;
    message: string;
}

interface DeleteLocationParams {
    locationId: number;
}

export async function deleteLocation({ 
    locationId 
}: DeleteLocationParams): Promise<DeleteLocationResponse> {
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

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

    if (error) {
        return { success: false, message: t('LOCATION_DELETION_FAILED') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);
    await upstashRedisCacheService.delete(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY);

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { success: true, message: t('LOCATION_DELETED') };
}