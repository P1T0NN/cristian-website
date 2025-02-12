// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search) {
        return NextResponse.json({ success: true, message: t('NO_SEARCH_TERM'), data: [] });
    }

    const { data, error } = await supabase
        .from('locations')
        .select('location_name, location_url, default_price')
        .ilike('location_name', `${search}%`)
        .limit(3);

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_SEARCH_LOCATIONS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('LOCATIONS_FETCHED'), data: data });
};