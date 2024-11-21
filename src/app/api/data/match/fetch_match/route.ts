// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

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
import type { typesMatchWithPlayers } from '@/types/typesMatchWithPlayers';

const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const [genericMessages, fetchMessages] = await Promise.all([
        getTranslations("GenericMessages"),
        getTranslations("FetchMessages")
    ]);

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const { matchId } = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FETCH_INVALID_REQUEST') }, { status: 400 });
    }

    const [cacheResult, playersResult] = await Promise.all([
        upstashRedisCacheService.get<typesMatch>(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`),
        supabase.from('match_players').select(`
            *,
            user:users (
                id,
                email,
                fullName,
                player_position,
                phoneNumber,
                is_verified,
                isAdmin,
                created_at
            )
        `).eq('match_id', matchId)
    ]);

    let match: typesMatch | null = null;

    if (cacheResult.success && cacheResult.data) {
        match = cacheResult.data;
    } else {
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
        await upstashRedisCacheService.set(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`, match, CACHE_TTL);
    }

    if (!match) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_NOT_FOUND') }, { status: 404 });
    }

    if (playersResult.error) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    const players = playersResult.data || [];

    const team1Players = players
        .filter(p => p.team_number === 1)
        .map(p => ({
            ...p.user,
            matchPlayer: {
                id: p.id,
                matchId: p.match_id,
                userId: p.user_id,
                substitute_requested: p.substitute_requested,
                team_number: p.team_number,
                created_at: p.created_at,
                has_paid: p.has_paid,
                has_discount: p.has_discount,
                has_gratis: p.has_gratis
            }
        }));

    const team2Players = players
        .filter(p => p.team_number === 2)
        .map(p => ({
            ...p.user,
            matchPlayer: {
                id: p.id,
                matchId: p.match_id,
                userId: p.user_id,
                substitute_requested: p.substitute_requested,
                team_number: p.team_number,
                created_at: p.created_at,
                has_paid: p.has_paid,
                has_discount: p.has_discount,
                has_gratis: p.has_gratis
            }
        }));

    const matchWithPlayers: typesMatchWithPlayers = {
        match,
        team1Players,
        team2Players
    };

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), data: matchWithPlayers });
}