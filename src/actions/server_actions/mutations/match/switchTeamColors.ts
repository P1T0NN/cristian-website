"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache'

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function switchTeamColors(
    authToken: string,
    matchId: string,
    teamNumber: 1 | 2
) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                    
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !teamNumber) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
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
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("COLOR_TOGGLED") };
}