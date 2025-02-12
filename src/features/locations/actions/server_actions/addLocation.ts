"use server"

// NEXTJS IMPORTS
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesAddLocationForm } from '../../types/AddLocationForm';
import type { typesLocation } from '../../types/typesLocation';

interface AddLocationResponse {
    success: boolean;
    message: string;
    data?: typesLocation;
}

interface AddLocationParams {
    addLocationData: typesAddLocationForm;
}

export async function addLocation({ 
    addLocationData 
}: AddLocationParams): Promise<AddLocationResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!addLocationData) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { location_name, location_url } = addLocationData;

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
        .insert([{ location_name, location_url }])
        .select()
        .single();

    if (error) {
        return { success: false, message: t('LOCATION_CREATION_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { success: true, message: t('LOCATION_CREATED'), data: data as typesLocation };
}