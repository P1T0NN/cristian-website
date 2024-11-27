// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatch } from '@/types/typesMatch';

const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

export async function GET(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const time = url.searchParams.get('time');
    const gender = url.searchParams.get('gender');
    const isAdmin = url.searchParams.get('isAdmin') === 'true';
    const playerLevel = url.searchParams.get('playerLevel');

    let matchesQuery = supabase
        .from('matches')
        .select('*')
        .order('starts_at_day', { ascending: true })
        .order('starts_at_hour', { ascending: true });

    if (date) {
        matchesQuery = matchesQuery.gte('starts_at_day', date);
    }

    if (time) {
        matchesQuery = matchesQuery.gte('starts_at_hour', time);
    }

    if (!isAdmin && gender) {
        matchesQuery = matchesQuery.or(`match_gender.eq.${gender},match_gender.eq.Mixed`);
    }

    const { data: dbMatches, error: supabaseError } = await matchesQuery.returns<typesMatch[]>();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!dbMatches || dbMatches.length === 0) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_MATCHES_FOUND'), data: [] });
    }

    const filteredMatches = dbMatches.filter(match => {
        if (isAdmin) return true;
        if (!playerLevel) return false;
        return match.match_level && match.match_level.includes(playerLevel);
    });

    const cachedMatches = await Promise.all(filteredMatches.map(async (match) => {
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${match.id}`;
        const cachedMatch = await upstashRedisCacheService.get<typesMatch>(cacheKey);
        
        if (cachedMatch.success && cachedMatch.data) {
            return cachedMatch.data;
        }
        
        await upstashRedisCacheService.set(cacheKey, match, CACHE_TTL);
        return match;
    }));

    return NextResponse.json({ success: true, message: fetchMessages('MATCHES_SUCCESSFULLY_FETCHED'), data: cachedMatches });
}