// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const CACHE_TTL = 300; // 5 minutes in seconds

export async function GET(req: Request): Promise<NextResponse<APIResponse>> {
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

    const userId = payload.sub;
    const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;

    // Try to get user data from cache first
    const cachedResult = await upstashRedisCacheService.get(cacheKey);
    if (cachedResult.success && cachedResult.data) {
        return NextResponse.json({ success: true, message: fetchMessages('USER_DATA_SUCCESSFULLY_FETCHED'), data: cachedResult.data });
    }

    // If not in cache or cache error, fetch from database
    const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, email, fullName, phoneNumber, created_at, is_verified, isAdmin')
        .eq('id', userId)
        .single();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: genericMessages('USER_DATA_FAILED_TO_FETCH') }, { status: 500 });
    }

    // Store the fetched data in cache
    await upstashRedisCacheService.set(cacheKey, data, CACHE_TTL);

    return NextResponse.json({ success: true, message: fetchMessages('USER_DATA_SUCCESSFULLY_FETCHED'), data });
}