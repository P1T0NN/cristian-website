// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatch } from '@/types/typesMatch';
import type { typesMatchWithPlayers } from '@/types/typesMatchWithPlayers';

const MATCH_CACHE_KEY_PREFIX = 'match:';
const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
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

    const { matchId } = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FETCH_INVALID_REQUEST') }, { status: 400 });
    }

    // Try to get match data from Redis cache
    const cacheResult = await redisCacheService.get<typesMatch>(`${MATCH_CACHE_KEY_PREFIX}${matchId}`);

    let match: typesMatch | null = null;

    if (cacheResult.success && cacheResult.data) {
        match = cacheResult.data;
    } else {
        // If not in cache or cache retrieval failed, fetch from database
        const { data: dbMatch, error: matchError } = await supabase
            .from('matches')
            .select("*")
            .eq('id', matchId)
            .single();

        if (matchError) {
            return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
        }

        if (!dbMatch) {
            return NextResponse.json({ success: false, message: fetchMessages('MATCH_NOT_FOUND') }, { status: 404 });
        }

        match = dbMatch;

        // Store in Redis cache
        await redisCacheService.set(`${MATCH_CACHE_KEY_PREFIX}${matchId}`, match, CACHE_TTL);
    }

    // Check if match is null after all attempts to fetch it
    if (!match) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_NOT_FOUND') }, { status: 404 });
    }

    // Fetch players with their user details
    const { data: players, error: playersError } = await supabase
        .from('match_players')
        .select(`
            *,
            user:users (
                id,
                email,
                fullName,
                phoneNumber,
                is_verified,
                isAdmin,
                created_at
            )
        `)
        .eq('match_id', matchId);

    if (playersError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    // Organize players into teams
    const team1Players = players
        ?.filter(p => p.team_number === 1)
        .map(p => p.user) ?? [];

    const team2Players = players
        ?.filter(p => p.team_number === 2)
        .map(p => p.user) ?? [];

    const matchWithPlayers: typesMatchWithPlayers = {
        match, // Now we're sure match is not null
        team1Players,
        team2Players
    };

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), data: matchWithPlayers });
}