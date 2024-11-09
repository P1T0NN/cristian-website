// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesTeam } from '@/types/typesTeam';

const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function GET(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    // Try to get teams from Upstash Redis cache
    const cacheResult = await upstashRedisCacheService.get<typesTeam[]>(CACHE_KEYS.ALL_TEAMS_PREFIX);

    if (cacheResult.success && cacheResult.data) {
        return NextResponse.json({ success: true, message: fetchMessages('TEAMS_FETCHED'), data: cacheResult.data });
    }

    // If not in cache, fetch from database
    const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('team_name', { ascending: true });

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('FAILED_TO_FETCH_TEAMS') }, { status: 500 });
    }

    // Store in Upstash Redis cache
    await upstashRedisCacheService.set(CACHE_KEYS.ALL_TEAMS_PREFIX, teams, CACHE_TTL);

    return NextResponse.json({ success: true, message: fetchMessages('TEAMS_FETCHED'), data: teams });
}