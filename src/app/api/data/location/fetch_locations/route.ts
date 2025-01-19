// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { typesLocation } from '@/features/locations/types/typesLocation';

const CACHE_TTL = 60 * 60; // 1 hour in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (_request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    // Try to get locations from Upstash Redis cache
    const cacheResult = await upstashRedisCacheService.get<typesLocation[]>(CACHE_KEYS.ALL_LOCATIONS_PREFIX);

    if (cacheResult.success && cacheResult.data) {
        return NextResponse.json({ success: true, message: t('LOCATIONS_FETCHED'), data: cacheResult.data });
    }

    // If not in cache, fetch from database
    const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .order('location_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_FETCH_LOCATIONS') }, { status: 500 });
    }

    // Store in Upstash Redis cache
    await upstashRedisCacheService.set(CACHE_KEYS.ALL_LOCATIONS_PREFIX, locations, CACHE_TTL);

    return NextResponse.json({ success: true, message: t('LOCATIONS_FETCHED'), data: locations });
});