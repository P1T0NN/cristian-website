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
import { typesAddLocationForm } from '@/types/forms/AddLocationForm';

export async function addLocation(authToken: string, addLocationData: typesAddLocationForm) {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const location_name = addLocationData.location_name;
    const location_url = addLocationData.location_url;

    if (!location_name) {
        return  { success: false, message: t('LOCATION_NAME_REQUIRED') };
    }
    
    if (!location_url) {
        return { success: false, message: t('LOCATION_URL_REQUIRED') };
    }

    // Check for existing location name (case-insensitive)
    const { data: existingLocation } = await supabase
        .from('locations')
        .select('id')
        .ilike('location_name', location_name);

    if (existingLocation && existingLocation.length > 0) {
        return { success: false, message: t('LOCATION_ALREADY_EXISTS') };
    }

    // Insert new location if no duplicate found
    const { data, error } = await supabase
        .from('locations')
        .insert([{ location_name, location_url }]);

    if (error) {
        return { success: false, message: t('LOCATION_CREATION_FAILED') };
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_LOCATIONS_PREFIX);

    revalidatePath("/");

    return { success: true, message: t('LOCATION_CREATED'), data };
}