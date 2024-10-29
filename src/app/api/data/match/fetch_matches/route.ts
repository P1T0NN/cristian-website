// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatch } from '@/types/typesMatch';

const ALL_MATCHES_CACHE_KEY = 'all_matches';
const MATCH_CACHE_KEY_PREFIX = 'match_';
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

export async function GET(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    // Try to get data from Redis cache
    const cacheResult = await redisCacheService.get<typesMatch[]>(ALL_MATCHES_CACHE_KEY);

    let matches: typesMatch[] | null = null;

    if (cacheResult.success && cacheResult.data) {
        matches = cacheResult.data;
    } else {
        // If not in cache or cache retrieval failed, fetch from database
        const { data: dbMatches, error: supabaseError } = await supabase
            .from('matches')
            .select('*')
            .order('created_at', { ascending: false })
            .returns<typesMatch[]>();

        if (supabaseError) {
            return NextResponse.json({ success: false, message: fetchMessages('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
        }

        matches = dbMatches;

        // Store in Redis cache
        if (matches && matches.length > 0) {
            await redisCacheService.set(ALL_MATCHES_CACHE_KEY, matches, CACHE_TTL);

            // Cache individual matches
            for (const match of matches) {
                await redisCacheService.set(`${MATCH_CACHE_KEY_PREFIX}${match.id}`, match, CACHE_TTL);
            }
        }
    }

    if (!matches || matches.length === 0) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_MATCHES_FOUND'), data: [] });
    }

    return NextResponse.json({ success: true, message: fetchMessages('MATCHES_SUCCESSFULLY_FETCHED'), data: matches });
}