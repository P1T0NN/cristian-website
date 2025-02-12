// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') }, { status: 400 });
    }

    // Fetch team from database
    const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_FETCH_TEAM') }, { status: 500 });
    }

    if (!team) {
        return NextResponse.json({ success: false, message: t('TEAM_NOT_FOUND') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: t('TEAM_FETCHED'), data: team });
};