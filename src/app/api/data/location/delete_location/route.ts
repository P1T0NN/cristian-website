// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const LOCATIONS_CACHE_KEY = 'all_locations';

export async function DELETE(req: Request): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations("GenericMessages");

    const { locationId } = await req.json();

    if (!locationId) {
        return NextResponse.json({ success: false, message: t('LOCATION_ID_REQUIRED') }, { status: 400 });
    }

    const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

    if (error) {
        return NextResponse.json({ success: false, message: t('LOCATION_DELETION_FAILED') }, { status: 500 });
    }

    // Invalidate the locations cache
    await upstashRedisCacheService.delete(LOCATIONS_CACHE_KEY);

    return NextResponse.json({ success: true, message: t('LOCATION_DELETED') });
}