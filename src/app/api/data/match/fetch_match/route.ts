// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatchWithPlayers } from '@/types/typesMatchWithPlayers';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
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

    // Fetch match data
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('id', matchId)
        .single();

    if (matchError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

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
        match,
        team1Players,
        team2Players
    };

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), data: matchWithPlayers });
}