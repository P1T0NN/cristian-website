// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';

const ALL_MATCHES_CACHE_KEY = 'all_matches';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'addMatch');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_CREATION_RATE_LIMITED') }, { status: 429 });
    }
    
    const matchData: typesAddMatchForm = await req.json();

    const { data, error } = await supabase
        .from('matches')
        .insert([
            {
                location: matchData.location,
                location_url: matchData.location_url,
                price: matchData.price,
                team1_name: matchData.team1_name,
                team2_name: matchData.team2_name,
                starts_at_day: matchData.starts_at_day,
                starts_at_hour: matchData.starts_at_hour,
                match_type: matchData.match_type,
                match_gender: matchData.match_gender,
                added_by: matchData.added_by
            }
        ]);

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_CREATION_FAILED') }, { status: 400 });
    }

    // Invalidate the all_matches cache
    await redisCacheService.delete(ALL_MATCHES_CACHE_KEY);

    return NextResponse.json({ success: true, message: genericMessages("MATCH_CREATED"), data });
}