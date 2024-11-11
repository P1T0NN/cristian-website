"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

export async function finishMatch(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    if (!authToken || !matchId) {
        return { success: false, message: genericMessages(authToken ? 'MATCH_ID_INVALID' : 'UNAUTHORIZED') };
    }

    try {
        await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select(`
            id, price, team1_name, team2_name, starts_at_day, starts_at_hour, 
            match_type, match_gender, created_at, location, added_by, 
            location_url, team1_color, team2_color, match_instructions
        `)
        .eq('id', matchId)
        .single();

    if (fetchError || !matchData) {
        return { success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') };
    }

    const { error: insertError } = await supabase
        .from('match_history')
        .insert({ 
            ...matchData, 
            finished_at: new Date().toISOString() 
        });

    if (insertError) {
        return { success: false, message: genericMessages('MATCH_HISTORY_INSERT_FAILED') };
    }

    const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .match({ id: matchId });

    if (deleteError) {
        return { success: false, message: genericMessages('MATCH_DELETION_FAILED') };
    }

    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);
    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_FINISHED") };
}