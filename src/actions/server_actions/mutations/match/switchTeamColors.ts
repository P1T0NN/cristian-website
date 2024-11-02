"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache'

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { serverActionRateLimit } from '@/lib/ratelimit/server_actions/serverActionRateLimit';
import { jwtVerify } from 'jose';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

const MATCH_CACHE_KEY_PREFIX = 'match:';

export async function switchTeamColors(
    authToken: string,
    matchId: string,
    teamNumber: 1 | 2
) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const rateLimitResult = await serverActionRateLimit('switchTeamColor');
    if (!rateLimitResult.success) {
        return { success: false, message: genericMessages('COLOR_TOGGLE_RATE_LIMITED') };
    }

    // Fetch current match data
    const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select('team1_color, team2_color')
        .eq('id', matchId)
        .single();

    if (fetchError) {
        return { success: false, message: genericMessages('COLOR_TOGGLE_FAILED') };
    }

    // Prepare update data
    let updateData = {};
    if (teamNumber === 1) {
        updateData = {
            team1_color: !matchData.team1_color,
            team2_color: matchData.team1_color
        };
    } else if (teamNumber === 2) {
        updateData = {
            team2_color: !matchData.team2_color,
            team1_color: matchData.team2_color
        };
    }

    // Update the match
    const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);

    if (error) {
        return { success: false, message: genericMessages('COLOR_TOGGLE_FAILED') };
    }

    // Invalidate the specific match cache
    await redisCacheService.delete(`${MATCH_CACHE_KEY_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("COLOR_TOGGLED") };
}