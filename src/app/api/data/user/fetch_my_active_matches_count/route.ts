import { NextResponse, NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { withAuth } from '@/middleware/withAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const requestUserId = searchParams.get('userId');

    if (!requestUserId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const { data: matchIds, error: matchIdsError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', requestUserId);

    if (matchIdsError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    const ids = matchIds.map(item => item.match_id);

    const { count, error: countError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .in('id', ids)
        .gte('starts_at_day', currentDate);

    if (countError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_COUNT_FETCH_FAILED') });
    }

    return NextResponse.json({ success: true, message: t('ACTIVE_MATCHES_COUNT_FETCHED'), data: { count } });
});