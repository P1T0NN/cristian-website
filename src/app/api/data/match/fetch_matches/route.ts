// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

// CONFIG
import { CACHE_KEYS } from '@/config';

const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const gender = searchParams.get('gender');
    const isAdmin = searchParams.get('isAdmin') === 'true';
    const playerLevel = searchParams.get('playerLevel');
    const isPastMatches = searchParams.get('isPastMatches') === 'true';
    const status = searchParams.get('status');

    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTimeString = currentDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    // Start with a base query
    let matchesQuery = supabase
        .from('matches')
        .select('*');

    // Handle date filtering first, exactly like the old version
    if (date) {
        matchesQuery = matchesQuery
            .eq('starts_at_day', date)
            .neq('status', 'finished')  // Don't show finished matches
            .order('starts_at_hour', { ascending: true });
    } else if (status === 'active') {
        matchesQuery = matchesQuery
            .neq('status', 'finished')
            .gte('starts_at_day', currentDateString)
            .or(`starts_at_day.eq.${currentDateString},starts_at_hour.gte.${currentTimeString}`)
            .order('starts_at_day', { ascending: true })
            .order('starts_at_hour', { ascending: true });
    } else if (isPastMatches) {
        matchesQuery = matchesQuery
            .lt('starts_at_day', currentDateString)
            .or(`starts_at_day.eq.${currentDateString},starts_at_hour.lt.${currentTimeString}`)
            .order('starts_at_day', { ascending: false })
            .order('starts_at_hour', { ascending: false })
            .limit(20);
    } else {
        matchesQuery = matchesQuery
            .gt('starts_at_day', currentDateString)
            .or(`starts_at_day.eq.${currentDateString},starts_at_hour.gte.${currentTimeString}`)
            .neq('status', 'finished')  // Don't show finished matches
            .order('starts_at_day', { ascending: true })
            .order('starts_at_hour', { ascending: true });
    }

    // Apply gender filter after date filtering, exactly like the old version
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

    const { data: userMatches, error: userMatchesError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', userId);

    if (userMatchesError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    const userMatchIds = new Set(userMatches?.map(um => um.match_id) || []);

    const filteredMatches = dbMatches.filter(match => {
        if (isAdmin || isPastMatches) return true;
        if (!playerLevel) return false;
        if (match.match_level && !match.match_level.includes(playerLevel)) return false;

        // For non-admin users, filter out matches that have already started
        if (!isPastMatches && match.starts_at_day === currentDateString && match.starts_at_hour < currentTimeString) {
            return false;
        }

        return true;
    });

    await Promise.all(filteredMatches.map(async (match) => {
        const matchWithoutPlayers = { 
            ...match,
            isUserInMatch: userMatchIds.has(match.id)
        };
        delete matchWithoutPlayers.match_players;
        
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${match.id}`;
        try {
            await upstashRedisCacheService.set(cacheKey, matchWithoutPlayers, CACHE_TTL);
        } catch {
            // Silently fail if caching encounters an error
        }
    }));

    return NextResponse.json({ 
        success: true, 
        message: t('MATCHES_SUCCESSFULLY_FETCHED'), 
        data: filteredMatches.map(match => ({
            ...match,
            isUserInMatch: userMatchIds.has(match.id)
        }))
    });
});