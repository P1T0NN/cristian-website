// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatch } from '@/types/typesMatch';

export async function GET(req: Request): Promise<NextResponse<APIResponse<typesMatch[]>>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const isValidToken = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    if (!isValidToken) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, message: genericMessages('USER_ID_REQUIRED') });
    }

    // Step 1: Fetch match IDs for the user from match_players
    const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', userId);

    if (matchPlayersError) {
        return NextResponse.json({ success: false, message: fetchMessages('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const matchIds = matchPlayers.map(mp => mp.match_id);

    // Step 2: Fetch match data for the retrieved match IDs
    const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .in('id', matchIds);

    if (matchesError) {
        return NextResponse.json({ success: false, message: fetchMessages('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    // Type assertion here. Make sure the fields in your database match typesMatch
    const typedMatches = matches as typesMatch[];

    return NextResponse.json({ success: true, message: fetchMessages('ACTIVE_MATCHES_FETCHED'), data: typedMatches });
}