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
    
    const { isAuth } = await verifyAuth();
                        
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

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { 
        success: true, 
        message: isDefault ? t('DEFAULT_LOCATION_SET') : t('DEFAULT_LOCATION_UNSET'), 
        data: data as typesLocation 
    };
}