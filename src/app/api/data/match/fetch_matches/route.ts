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
export const GET = withAuth(async (request: NextRequest, userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const gender = searchParams.get('gender');
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const playerLevel = searchParams.get('playerLevel');
    const includeOldMatches = searchParams.get('includeOldMatches') === 'true';

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTimeString = currentDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    let matchesQuery = supabase
        .from('matches')
        .select('*')
        .order('starts_at_day', { ascending: includeOldMatches ? false : true })
        .order('starts_at_hour', { ascending: includeOldMatches ? false : true });

    if (includeOldMatches) {
        matchesQuery = matchesQuery
            .lt('starts_at_day', currentDateString)
            .or(`starts_at_day.eq.${currentDateString},starts_at_hour.lt.${currentTimeString}`)
            .limit(20);
    } else if (date) {
        matchesQuery = matchesQuery.eq('starts_at_day', date);
    } else {
        matchesQuery = matchesQuery
            .gt('starts_at_day', currentDateString)
            .or(`starts_at_day.eq.${currentDateString},starts_at_hour.gte.${currentTimeString}`);
    }

    if (!isAdmin && gender) {
        matchesQuery = matchesQuery.or(`match_gender.eq.${gender},match_gender.eq.Mixed`);
    }

    const { data: dbMatches, error: supabaseError } = await matchesQuery;

    if (supabaseError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!dbMatches || dbMatches.length === 0) {
        return NextResponse.json({ success: true, message: t('NO_MATCHES_FOUND'), data: [] });
    }

    // Fetch user's matches
    const { data: userMatches } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', userId);

    const userMatchIds = new Set(userMatches?.map(um => um.match_id) || []);

    const filteredMatches = dbMatches.filter(match => {
        if (isAdmin || includeOldMatches) return true;
        if (!playerLevel) return false;
        if (match.match_level && !match.match_level.includes(playerLevel)) return false;

        // For non-admin users, filter out matches that have already started
        if (!includeOldMatches && match.starts_at_day === currentDateString && match.starts_at_hour < currentTimeString) {
            return false;
        }

        return true;
    });

    const cachedMatches = await Promise.all(filteredMatches.map(async (match) => {
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${match.id}`;
        const cachedMatch = await upstashRedisCacheService.get<typesMatch>(cacheKey);
        
        let matchData: typesMatch;
        if (cachedMatch.success && cachedMatch.data) {
            matchData = cachedMatch.data;
        } else {
            matchData = match;
            await upstashRedisCacheService.set(cacheKey, match, CACHE_TTL);
        }

        return {
            ...matchData,
            isUserInMatch: userMatchIds.has(match.id)
        };
    }));

    return NextResponse.json({ success: true, message: t('MATCHES_SUCCESSFULLY_FETCHED'), data: cachedMatches });
});