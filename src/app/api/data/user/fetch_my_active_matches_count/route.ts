// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function GET(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ success: false, message: genericMessages('USER_ID_REQUIRED') });
    }

    // Get current date in UTC
    const currentDate = new Date().toISOString().split('T')[0];

    // First Supabase call: Get match IDs for the user
    const { data: matchIds, error: matchIdsError } = await supabase
        .from('match_players')
        .select('match_id')
        .eq('user_id', userId);

    if (matchIdsError) {
        return NextResponse.json({ success: false, message: fetchMessages('ACTIVE_MATCHES_FETCH_FAILED') });
    }

    // Extract match IDs from the result
    const ids = matchIds.map(item => item.match_id);

    // Second Supabase call: Count active matches
    const { count, error: countError } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .in('id', ids)
        .gte('starts_at_day', currentDate);

    if (countError) {
        return NextResponse.json({ success: false, message: fetchMessages('ACTIVE_MATCHES_COUNT_FETCH_FAILED') });
    }

    return NextResponse.json({ success: true, message: fetchMessages('ACTIVE_MATCHES_COUNT_FETCHED'), data: count });
}