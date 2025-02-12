// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const { data: defaultLocations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_default', true)
        .order('location_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_FETCH_DEFAULT_LOCATIONS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('DEFAULT_LOCATIONS_FETCHED'), data: defaultLocations });
};