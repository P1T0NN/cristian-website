// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// TYPES
import type { typesMatch } from '@/features/matches/types/typesMatch';

// UTILS
import { getCurrentDateTimeStrings } from '@/shared/utils/dateUtils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('userId');

    if (!requestUserId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }

    const { data: matchPlayers, error: matchPlayersError } = await supabase
        .from('match_players')
        .select('matchId')
        .eq('userId', requestUserId);

    if (matchPlayersError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const matchIds = matchPlayers.map(mp => mp.matchId);

    const { currentDate, currentTime } = getCurrentDateTimeStrings();

    const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .in('id', matchIds)
        .eq('status', 'active')
        .gte('date', currentDate)
        .or(`date.eq.${currentDate},and(time.gte.${currentTime})`);

    if (matchesError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const typedMatches = matches as typesMatch[];

    return NextResponse.json({ success: true, message: t('ACTIVE_MATCHES_FETCHED'), data: typedMatches });
};