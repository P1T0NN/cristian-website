// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .eq('match_id', matchId)
        .eq('user_id', userId)
        .single();

    if (error) {
        return NextResponse.json({ success: false, message: t('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: t('MATCH_SUCCESSFULLY_FETCHED'), 
        data: data?.has_match_admin || false
    });
});