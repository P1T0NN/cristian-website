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

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';
import type { typesMatchWithPlayers } from '@/features/matches/types/typesMatchWithPlayers';
import type { typesPlayer } from '@/features/players/types/typesPlayer';
import type { typesRegularPlayer } from '@/features/players/types/typesPlayer';
import type { typesTemporaryPlayer } from '@/features/players/types/typesPlayer';

const CACHE_TTL = 60 * 60 * 12; // 12 hours in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') }, { status: 400 });
    }

    const [cacheResult, playersResult] = await Promise.all([
        upstashRedisCacheService.get<typesMatch>(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`),
        supabase
            .from('match_players')
            .select(`
                *,
                user:users (
                    id,
                    email,
                    fullName,
                    player_position,
                    phoneNumber,
                    is_verified,
                    isAdmin,
                    created_at,
                    player_debt,
                    cristian_debt,
                    player_level,
                    dni,
                    country,
                    has_access,
                    balance,
                    verify_documents
                ),
                added_by:users (
                    id,
                    fullName
                )
            `)
            .eq('match_id', matchId)
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
            return NextResponse.json({ success: false, message: t('MATCH_FAILED_TO_FETCH') }, { status: 500 });
        }

        if (!dbMatch) {
            return NextResponse.json({ success: false, message: t('MATCH_NOT_FOUND') }, { status: 404 });
        }

        match = dbMatch;
        await upstashRedisCacheService.set(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`, match, CACHE_TTL);
    }

    if (!match) {
        return NextResponse.json({ success: false, message: t('MATCH_NOT_FOUND') }, { status: 404 });
    }

    if (playersResult.error) {
        return NextResponse.json({ success: false, message: t('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    const players = playersResult.data || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapPlayer = (p: any): typesPlayer => {
        const basePlayer = {
            id: p.id,
            teamNumber: p.team_number,
            substituteRequested: p.substitute_requested,
            matchId: p.match_id,
        };

        if (p.player_type === 'regular') {
            return {
                ...basePlayer,
                type: 'regular',
                user: p.user,
                matchPlayer: {
                    id: p.id,
                    matchId: p.match_id,
                    userId: p.user_id,
                    player_type: p.player_type,
                    team_number: p.team_number,
                    substitute_requested: p.substitute_requested,
                    created_at: p.created_at,
                    has_paid: p.has_paid,
                    has_discount: p.has_discount,
                    has_gratis: p.has_gratis,
                    has_match_admin: p.has_match_admin,
                    has_added_friend: p.has_added_friend,
                    has_entered_with_balance: p.has_entered_with_balance,
                    user: p.user ? {
                        id: p.user.id,
                        fullName: p.user.fullName
                    } : undefined
                }
            } as typesRegularPlayer;
        } else {
            return {
                ...basePlayer,
                type: 'temporary',
                temporary_player_name: p.temporary_player_name || 'Unknown Player',
                phoneNumber: p.phone_number || '',
                teamNumber: p.team_number,
                substituteRequested: p.substitute_requested,
                matchPlayer: {
                    id: p.id,
                    matchId: p.match_id,
                    userId: p.user_id,        // This is the added_by_id for temporary players
                    player_type: 'temporary',
                    team_number: p.team_number,
                    substitute_requested: p.substitute_requested,
                    temporary_player_name: p.temporary_player_name,
                    created_at: p.created_at,
                    has_paid: p.has_paid,
                    has_discount: p.has_discount,
                    has_gratis: p.has_gratis,
                    has_match_admin: false,
                    has_added_friend: p.has_added_friend,
                    has_entered_with_balance: p.has_entered_with_balance,
                    added_by: p.added_by ? {
                        id: p.added_by.id,
                        fullName: p.added_by.fullName
                    } : undefined
                }
            } as typesTemporaryPlayer;
        }
    };

    const allPlayers = players.map(mapPlayer);

    const matchWithPlayers: typesMatchWithPlayers = {
        match,
        players: allPlayers.map(player => ({
            type: player.type,
            player: player,
            team_number: player.teamNumber as 0 | 1 | 2
        }))
    };

    return NextResponse.json({ success: true, message: t('MATCH_SUCCESSFULLY_FETCHED'), data: matchWithPlayers });
});