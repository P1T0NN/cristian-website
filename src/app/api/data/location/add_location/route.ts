// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations("GenericMessages");

    const { location_name } = await req.json();

    if (!location_name) {
        return NextResponse.json({ success: false, message: t('LOCATION_NAME_REQUIRED') }, { status: 400 });
    }

    // Check for existing location name (case-insensitive)
    const { data: existingLocation } = await supabase
        .from('locations')
        .select('id')
        .ilike('location_name', location_name);

    if (existingLocation && existingLocation.length > 0) {
        return NextResponse.json({ success: false, message: t('LOCATION_ALREADY_EXISTS') }, { status: 409 });
    }

    // Insert new location if no duplicate found
    const { data, error } = await supabase
        .from('locations')
        .insert([{ location_name }]);

    if (error) {
        return NextResponse.json({ success: false, message: t('LOCATION_CREATION_FAILED') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('LOCATION_CREATED'), data });
}