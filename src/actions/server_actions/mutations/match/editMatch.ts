"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { serverActionRateLimit } from '@/lib/ratelimit/server_actions/serverActionRateLimit';
import { jwtVerify } from 'jose';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';

export async function editMatch(authToken: string, matchId: string, editMatchData: typesAddMatchForm) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const rateLimitResult = await serverActionRateLimit('editMatch');
    if (!rateLimitResult.success) {
        return { success: false, message: genericMessages('MATCH_EDIT_RATE_LIMITED') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('MATCH_ID_INVALID') };
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
            added_by: editMatchData.added_by
        })
        .eq('id', matchId);

    if (error) {
        return { success: false, message: genericMessages('MATCH_EDIT_FAILED') };
    }

    // Invalidate the specific match cache
    await redisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_UPDATED"), data };
}