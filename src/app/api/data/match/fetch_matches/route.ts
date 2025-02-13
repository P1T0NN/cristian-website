// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { typesPlayer } from '@/features/matches/types/typesMatch';

export async function GET(request: NextRequest) {
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
    const requestedUserId = searchParams.get('currentUserId');
    const filterByUserId = searchParams.get('filterByUserId') === 'true';

    let matchesQuery = supabase
        .from('matches')
        .select('*')
        .order('startsAtDay', { ascending: false })
        .order('startsAtHour', { ascending: false });

    // Apply date and status filters
    if (date) {
        matchesQuery = matchesQuery
            .eq('startsAtDay', date)
            .neq('status', 'finished');
    } else if (isPastMatches && currentDate && currentTime) {
        matchesQuery = matchesQuery.or(
            `startsAtDay.lt.${currentDate},and(startsAtDay.eq.${currentDate},startsAtHour.lt.${currentTime})`
        );
    } else if (status === 'active') {
        matchesQuery = matchesQuery
            .eq('status', status)
            .neq('status', 'finished');
    } else if (status) {
        matchesQuery = matchesQuery.eq('status', status);
    } else if (currentDate && currentTime) {
        matchesQuery = matchesQuery.or(
            `startsAtDay.gt.${currentDate},and(startsAtDay.eq.${currentDate},startsAtHour.gte.${currentTime})`
        );
    }

    // Apply gender filter for non-admin users
    if (!isAdmin && gender) {
        matchesQuery = matchesQuery.or(`matchGender.eq.${gender},matchGender.eq.Mixed`);
    }

    const { data: dbMatches, error: supabaseError } = await matchesQuery;

    if (supabaseError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!dbMatches || dbMatches.length === 0) {
        return NextResponse.json({ success: true, message: t('NO_MATCHES_FOUND'), data: [] });
    }

    // Fetch match players with user information
    const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select(`
            *,
            user:user (
                id,
                name
            )
        `)
        .in('matchId', dbMatches.map(match => match.id));

    if (matchPlayersError) {
        return NextResponse.json({ success: false, message: t('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    // Group players by match
    const playersByMatch = matchPlayers?.reduce((acc, player) => {
        if (!acc[player.matchId]) {
            acc[player.matchId] = [];
        }
        // Add the player with the correct name field
        acc[player.matchId].push({
            ...player,
            name: player.playerType === 'temporary' ? 
                player.temporaryPlayerName : 
                player.user?.name
        });
        return acc;
    }, {});

    let filteredMatches = dbMatches.map(match => ({
        ...match,
        matchPlayers: playersByMatch[match.id] || []
    }));

    // Filter matches by player level if not admin
    if (!isAdmin) {
        filteredMatches = filteredMatches.filter(match => {
            if (!playerLevel) return false;
            if (match.matchLevel && !match.matchLevel.includes(playerLevel)) return false;
            return true;
        });
    }

    // Only filter by userId if filterByUserId is true
    if (filterByUserId && requestedUserId && requestedUserId !== 'undefined') {
        filteredMatches = filteredMatches.filter(match => 
            match.matchPlayers.some((player: typesPlayer) => player.userId === requestedUserId)
        );
    }

    // Always add isUserInMatch flag regardless of filtering
    const matchesWithUserStatus = filteredMatches.map(match => ({
        ...match,
        isUserInMatch: requestedUserId ? 
            match.matchPlayers.some((player: typesPlayer) => player.userId === requestedUserId) : 
            false
    }));

    return NextResponse.json({ 
        success: true, 
        message: t('MATCHES_SUCCESSFULLY_FETCHED'), 
        data: matchesWithUserStatus 
    });
}