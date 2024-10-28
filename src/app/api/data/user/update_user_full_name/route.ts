// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const CACHE_KEY_PREFIX = 'user:';
const CACHE_TTL = 300; // 5 minutes in seconds

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'updateFullName');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('UPDATE_FULL_NAME_RATE_LIMIT') }, { status: 429 });
    }

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const userId = payload.sub;
    const { fullName } = await req.json();

    if (!fullName) {
        return NextResponse.json({ success: false, message: genericMessages('FULL_NAME_REQUIRED') }, { status: 400 });
    }

    const { data, error: supabaseError } = await supabase
        .from('users')
        .update({ fullName })
        .eq('id', userId)
        .select()
        .single();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: genericMessages('USER_UPDATE_FAILED') }, { status: 500 });
    }

    // Clear the old cache for this user
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
    await redisCacheService.delete(cacheKey);

    // Set the new cache with the updated data
    await redisCacheService.set(cacheKey, data, CACHE_TTL);

    return NextResponse.json({ success: true, message: genericMessages('USER_FULL_NAME_UPDATED'), data });
}