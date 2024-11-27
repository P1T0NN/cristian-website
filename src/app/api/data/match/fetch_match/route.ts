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
import type { typesUser } from '@/types/typesUser';

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

    const [cacheResult, playersResult, temporaryPlayersResult] = await Promise.all([
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
        `).eq('match_id', matchId),
        supabase.from('temporary_players').select('*').eq('match_id', matchId)
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

    if (playersResult.error || temporaryPlayersResult.error) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    const players = playersResult.data || [];
    const temporaryPlayers = temporaryPlayersResult.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapPlayer = (p: any): typesUser => ({
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
            has_gratis: p.has_gratis,
            has_match_admin: p.has_match_admin
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapTemporaryPlayer = (p: any): typesUser => ({
        id: p.id,
        email: '',
        fullName: p.name,
        phoneNumber: '',
        gender: '',
        is_verified: false,
        isAdmin: false,
        player_debt: 0,
        cristian_debt: 0,
        player_level: '',
        player_position: '',
        created_at: new Date(p.created_at),
        dni: '',
        country: '',
        has_access: false,
        balance: 0,
        temporaryPlayer: {
            id: p.id,
            matchId: p.match_id,
            team_number: p.team_number,
            name: p.name,
            added_by: p.added_by,
            added_by_name: p.added_by_name,
            has_paid: p.has_paid,
            has_discount: p.has_discount,
            has_gratis: p.has_gratis
        }
    });

    const allPlayers: typesUser[] = [
        ...players.map(mapPlayer),
        ...temporaryPlayers.map(mapTemporaryPlayer)
    ];

    const team1Players = allPlayers.filter(p => (p.matchPlayer?.team_number === 1) || (p.temporaryPlayer?.team_number === 1));
    const team2Players = allPlayers.filter(p => (p.matchPlayer?.team_number === 2) || (p.temporaryPlayer?.team_number === 2));
    const unassignedPlayers = allPlayers.filter(p => (p.matchPlayer?.team_number === 0) || (p.temporaryPlayer?.team_number === 0));

    const matchWithPlayers: typesMatchWithPlayers = {
        match,
        team1Players,
        team2Players,
        unassignedPlayers
    };

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), data: matchWithPlayers });
}