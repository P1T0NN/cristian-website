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

    const { isAuth } = await verifyAuth();
                        
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

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { 
        success: true, 
        message: t('DEFAULT_PRICE_UPDATED'),
        data: data as typesLocation
    };
}