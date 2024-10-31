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

const MATCHES_CACHE_PREFIX = 'match:';
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

    // Fetch matches from database
    const { data: dbMatches, error: supabaseError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<typesMatch[]>();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    // If no matches found
    if (!dbMatches || dbMatches.length === 0) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_MATCHES_FOUND'), data: [] });
    }

    // Cache each match individually
    const cachedMatches = await Promise.all(dbMatches.map(async (match) => {
        const cacheKey = `${MATCHES_CACHE_PREFIX}${match.id}`;
        
        // Try to get from cache first
        const cachedMatch = await redisCacheService.get<typesMatch>(cacheKey);
        
        if (cachedMatch.success && cachedMatch.data) {
            return cachedMatch.data;
        }
        
        // If not in cache, cache the match
        await redisCacheService.set(cacheKey, match, CACHE_TTL);
        return match;
    }));

    return NextResponse.json({ success: true, message: fetchMessages('MATCHES_SUCCESSFULLY_FETCHED'), data: cachedMatches });
}