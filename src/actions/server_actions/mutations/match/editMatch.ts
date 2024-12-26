"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';
import type { typesMatch } from '@/types/typesMatch';

interface EditMatchResponse {
    success: boolean;
    message: string;
    data?: typesMatch;
}

interface EditMatchParams {
    matchIdFromParams: string;
    editMatchData: typesAddMatchForm;
}

export async function editMatch({
    matchIdFromParams,
    editMatchData
}: EditMatchParams): Promise<EditMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            location: editMatchData.location,
            location_url: editMatchData.location_url,
            price: editMatchData.price,
            team1_name: editMatchData.team1_name,
            team2_name: editMatchData.team2_name,
            starts_at_day: editMatchData.starts_at_day,
            starts_at_hour: editMatchData.starts_at_hour,
            match_type: editMatchData.match_type,
            match_gender: editMatchData.match_gender,
            match_duration: editMatchData.match_duration,
            added_by: editMatchData.added_by,
            match_level: editMatchData.match_level
        })
        .eq('id', matchIdFromParams)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('MATCH_EDIT_FAILED') };
    }

    // Invalidate the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`);

    revalidatePath("/");

    return { success: true, message: t("MATCH_UPDATED"), data: data as typesMatch };
}