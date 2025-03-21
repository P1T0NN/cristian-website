// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// Import our date utility functions
import { getCurrentDateString } from '@/shared/utils/dateUtils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");
    const requestUserId = request.nextUrl.searchParams.get('userId');
 
    if (!requestUserId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }
 
    const currentDate = getCurrentDateString();
    const { data: matchIds, error: matchIdsError } = await supabase
        .from('match_players')
        .select('matchId')
        .eq('userId', requestUserId);
 
    if (matchIdsError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_FETCH_FAILED') });
    }
 
    const ids = matchIds.map(item => item.matchId);
    
    if (ids.length === 0) {
        return NextResponse.json({ 
            success: true, 
            message: t('ACTIVE_MATCHES_COUNT_FETCHED'), 
            data: { count: 0 } 
        });
    }
 
    const { count, error: countError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .in('id', ids)
        .gte('startsAtDay', currentDate)
        .neq('status', 'finished');
 
    if (countError) {
        return NextResponse.json({ success: false, message: t('ACTIVE_MATCHES_COUNT_FETCH_FAILED') });
    }
 
    return NextResponse.json({ 
        success: true, 
        message: t('ACTIVE_MATCHES_COUNT_FETCHED'), 
        data: { count } 
    });
};