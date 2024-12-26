// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { typesLocation } from '@/types/typesLocation';

const CACHE_TTL = 60 * 60; // 1 hour in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (_request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    // Try to get default locations from Upstash Redis cache
    const cacheResult = await upstashRedisCacheService.get<typesLocation[]>(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY);

    if (cacheResult.success && cacheResult.data) {
        return NextResponse.json({ success: true, message: t('DEFAULT_LOCATIONS_FETCHED'), data: cacheResult.data });
    }

    // If not in cache, fetch from database
    const { data: defaultLocations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_default', true)
        .order('location_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_FETCH_DEFAULT_LOCATIONS') }, { status: 500 });
    }

    // Store in Upstash Redis cache
    await upstashRedisCacheService.set(CACHE_KEYS.DEFAULT_LOCATIONS_CACHE_KEY, defaultLocations, CACHE_TTL);

    return NextResponse.json({ success: true, message: t('DEFAULT_LOCATIONS_FETCHED'), data: defaultLocations });
});