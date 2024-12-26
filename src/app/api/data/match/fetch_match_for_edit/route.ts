// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { typesMatch } from '@/types/typesMatch';

const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') }, { status: 400 });
    }

    // Try to get match data from Upstash Redis cache
    const cacheResult = await upstashRedisCacheService.get<typesMatch>(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    let match: typesMatch | null = null;

    if (cacheResult.success && cacheResult.data) {
        match = cacheResult.data;
    } else {
        // If not in cache or cache retrieval failed, fetch from database
        const { data: dbMatch, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError) {
            return NextResponse.json({ success: false, message: t('MATCH_FAILED_TO_FETCH') }, { status: 500 });
        }

        if (!dbMatch) {
            return NextResponse.json({ success: false, message: t('MATCH_NOT_FOUND') }, { status: 404 });
        }

        match = dbMatch;

        // Store in Upstash Redis cache
        await upstashRedisCacheService.set(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`, match, CACHE_TTL);
    }

    // Check if match is null after all attempts to fetch it
    if (!match) {
        return NextResponse.json({ success: false, message: t('MATCH_NOT_FOUND') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: t('MATCH_SUCCESSFULLY_FETCHED'), data: match });
});