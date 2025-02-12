// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') }, { status: 400 });
    }

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

    if (matchError) {
        return NextResponse.json({ success: false, message: t('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!match) {
        return NextResponse.json({ success: false, message: t('MATCH_NOT_FOUND') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: t('MATCH_SUCCESSFULLY_FETCHED'), data: match });
};