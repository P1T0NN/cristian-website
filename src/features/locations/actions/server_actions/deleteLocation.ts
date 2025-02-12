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

    const { isAuth } = await verifyAuth();
                        
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

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.LOCATIONS);

    return { success: true, message: t('LOCATION_DELETED') };
}