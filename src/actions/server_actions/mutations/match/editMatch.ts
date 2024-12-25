"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';

export async function editMatch(authToken: string, matchId: string, editMatchData: typesAddMatchForm) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
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
        .eq('id', matchId);

    if (error) {
        return { success: false, message: genericMessages('MATCH_EDIT_FAILED') };
    }

    // Invalidate the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_UPDATED"), data };
}