// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// TYPES
import type { typesMatch } from '@/types/typesMatch';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('userId');

    if (!requestUserId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }

    const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', requestUserId);

    if (matchPlayersError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const matchIds = matchPlayers.map(mp => mp.match_id);

    const currentDate = new Date().toISOString().split('T')[0];

    const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .in('id', matchIds)
        .gte('starts_at_day', currentDate)
        .order('starts_at_day', { ascending: true });

    if (matchesError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const typedMatches = matches as typesMatch[];

    return NextResponse.json({ success: true, message: t('ACTIVE_MATCHES_FETCHED'), data: typedMatches });
});