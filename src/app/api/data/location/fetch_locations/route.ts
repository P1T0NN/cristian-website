// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesLocation } from '@/types/typesLocation';

const LOCATIONS_CACHE_KEY = 'all_locations';
const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function GET(): Promise<NextResponse<APIResponse>> {
    const t = await getTranslations("FetchMessages");

    // Try to get locations from Redis cache
    const cacheResult = await redisCacheService.get<typesLocation[]>(LOCATIONS_CACHE_KEY);

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

    // Store in Redis cache
    await redisCacheService.set(LOCATIONS_CACHE_KEY, locations, CACHE_TTL);

    return NextResponse.json({ success: true, message: t('LOCATIONS_FETCHED'), data: locations });
}