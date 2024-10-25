// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function GET(request: Request): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations("FetchMessages");
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search) {
        return NextResponse.json({ success: true, message: t('NO_SEARCH_TERM'), data: [] });
    }

    const { data, error } = await supabase
        .from('locations')
        .select('location_name')
        .ilike('location_name', `${search}%`)
        .limit(3);

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_SEARCH_LOCATIONS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('LOCATIONS_FETCHED'), data: data });
}