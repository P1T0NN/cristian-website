"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';
import { serverActionRateLimit } from '@/lib/ratelimit/server_actions/serverActionRateLimit';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import { typesAddLocationForm } from '@/types/forms/AddLocationForm';

const LOCATIONS_CACHE_KEY = 'all_locations';

export async function addLocation(authToken: string, addLocationData: typesAddLocationForm) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const rateLimitResult = await serverActionRateLimit('deleteLocation');
    if (!rateLimitResult.success) {
        return { success: false, message: t('ADD_LOCATION_RATE_LIMITED') };
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
    await redisCacheService.delete(LOCATIONS_CACHE_KEY);

    revalidatePath("/");

    return { success: true, message: t('LOCATION_CREATED'), data };
}