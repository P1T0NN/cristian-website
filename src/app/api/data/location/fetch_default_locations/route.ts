// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesLocation } from '@/types/typesLocation';

const DEFAULT_LOCATIONS_CACHE_KEY = 'default_locations';
const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function GET(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    // Try to get default locations from Upstash Redis cache
    const cacheResult = await upstashRedisCacheService.get<typesLocation[]>(DEFAULT_LOCATIONS_CACHE_KEY);

    if (cacheResult.success && cacheResult.data) {
        return NextResponse.json({ success: true, message: fetchMessages('DEFAULT_LOCATIONS_FETCHED'), data: cacheResult.data });
    }

    // If not in cache, fetch from database
    const { data: defaultLocations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_default', true)
        .order('location_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('FAILED_TO_FETCH_DEFAULT_LOCATIONS') }, { status: 500 });
    }

    // Store in Upstash Redis cache
    await upstashRedisCacheService.set(DEFAULT_LOCATIONS_CACHE_KEY, defaultLocations, CACHE_TTL);

    return NextResponse.json({ success: true, message: fetchMessages('DEFAULT_LOCATIONS_FETCHED'), data: defaultLocations });
}

