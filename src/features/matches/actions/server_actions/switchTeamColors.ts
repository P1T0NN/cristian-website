"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface SwitchTeamColorsResponse {
    success: boolean;
    message: string;
}

interface SwitchTeamColorsParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
}

export async function switchTeamColors({
    matchIdFromParams,
    teamNumber
}: SwitchTeamColorsParams): Promise<SwitchTeamColorsResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Fetch current match data
    const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select('team1_color, team2_color')
        .eq('id', matchIdFromParams)
        .single();

    if (fetchError) {
        return { success: false, message: t('COLOR_TOGGLE_FAILED') };
    }

    // Prepare update data
    const updateData = teamNumber === 1
        ? { team1_color: !matchData.team1_color, team2_color: matchData.team1_color }
        : { team2_color: !matchData.team2_color, team1_color: matchData.team2_color };

    // Update the match
    const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchIdFromParams);

    if (error) {
        return { success: false, message: t('COLOR_TOGGLE_FAILED') };
    }

    // Invalidate the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`);

    revalidatePath("/");

    return { success: true, message: t("COLOR_TOGGLED") };
}
