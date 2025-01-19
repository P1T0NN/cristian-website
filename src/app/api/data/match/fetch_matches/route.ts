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
    const status = searchParams.get('status');
    const isPastMatches = searchParams.get('isPastMatches') === 'true';
    const currentDate = searchParams.get('currentDate');
    const currentTime = searchParams.get('currentTime');

    let matchesQuery = supabase
    .from('matches')
    .select('*')
    .order('starts_at_day', { ascending: false })
    .order('starts_at_hour', { ascending: false });

    if (date) {
        matchesQuery = matchesQuery
            .eq('starts_at_day', date)
            .neq('status', 'finished');
    } else if (isPastMatches && currentDate && currentTime) {
        matchesQuery = matchesQuery.or(
            `starts_at_day.lt.${currentDate},and(starts_at_day.eq.${currentDate},starts_at_hour.lt.${currentTime})`
        );
    } else if (status === 'active') {
        matchesQuery = matchesQuery
            .eq('status', status)
            .neq('status', 'finished');
    } else if (status) {
        matchesQuery = matchesQuery.eq('status', status);
    } else if (currentDate && currentTime) {
        matchesQuery = matchesQuery.or(
            `starts_at_day.gt.${currentDate},and(starts_at_day.eq.${currentDate},starts_at_hour.gte.${currentTime})`
        );
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

    const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select(`
            *,
            user:users (
                id,
                fullName
            )
        `)
        .in('match_id', dbMatches.map(match => match.id));

    if (matchPlayersError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    const playersByMatch = matchPlayers?.reduce((acc, player) => {
        if (!acc[player.match_id]) {
            acc[player.match_id] = [];
        }
        acc[player.match_id].push(player);
        return acc;
    }, {});

    const matchesWithPlayers = dbMatches.map(match => ({
        ...match,
        match_players: playersByMatch[match.id] || []
    }));

    const { data: userMatches, error: userMatchesError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', userId);

    if (userMatchesError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    const userMatchIds = new Set(userMatches?.map(um => um.match_id) || []);

    const filteredMatches = matchesWithPlayers.filter(match => {
        if (isAdmin) return true;
        if (!playerLevel) return false;
        if (match.match_level && !match.match_level.includes(playerLevel)) return false;
        return true;
    });

    await Promise.all(filteredMatches.map(async (match) => {
        const matchWithoutPlayers = { ...match };
        delete matchWithoutPlayers.match_players;
        
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${match.id}`;
        try {
            await upstashRedisCacheService.set(cacheKey, matchWithoutPlayers, CACHE_TTL);
        } catch {
            // Silently fail if caching encounters an error
        }
    }));

    const matchesWithUserStatus = filteredMatches.map(match => ({
        ...match,
        isUserInMatch: userMatchIds.has(match.id)
    }));

    return NextResponse.json({ 
        success: true, 
        message: t('MATCHES_SUCCESSFULLY_FETCHED'), 
        data: matchesWithUserStatus 
    });
});