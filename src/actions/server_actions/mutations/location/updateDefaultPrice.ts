"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesLocation } from '@/types/typesLocation';

interface UpdateDefaultPriceResponse {
    success: boolean;
    message: string;
    data?: typesLocation;
}

interface UpdateDefaultPriceParams {
    locationId: number;
    defaultPrice: string;
}

export async function updateDefaultPrice({ 
    locationId, 
    defaultPrice 
}: UpdateDefaultPriceParams): Promise<UpdateDefaultPriceResponse> {
    const t = await getTranslations('GenericMessages');

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!locationId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('locations')
        .update({ default_price: defaultPrice })
        .eq('id', locationId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('DEFAULT_PRICE_UPDATE_ERROR') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);
    await upstashRedisCacheService.delete(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY);

    revalidatePath("/");

    return { 
        success: true, 
        message: t('DEFAULT_PRICE_UPDATED'),
        data: data as typesLocation
    };
}