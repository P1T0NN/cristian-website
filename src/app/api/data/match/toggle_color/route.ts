// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache'

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const MATCH_CACHE_KEY_PREFIX = 'match:';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'toggleTeamColor');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('COLOR_TOGGLE_RATE_LIMITED') }, { status: 429 });
    }
    
    const { matchId, teamNumber } = await req.json();

    // Fetch current match data
    const { data: matchData, error: fetchError } = await supabase
        .from('matches')
        .select('team1_color, team2_color')
        .eq('id', matchId)
        .single();

    if (fetchError) {
        return NextResponse.json({ success: false, message: genericMessages('COLOR_TOGGLE_FAILED') }, { status: 400 });
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
    const { data, error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('COLOR_TOGGLE_FAILED') }, { status: 400 });
    }

    // Invalidate the specific match cache
    await redisCacheService.delete(`${MATCH_CACHE_KEY_PREFIX}${matchId}`);

    return NextResponse.json({ success: true, message: genericMessages("COLOR_TOGGLED"), data });
}