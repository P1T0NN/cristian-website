// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('team_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_FETCH_TEAMS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('TEAMS_FETCHED'), data: teams });
};