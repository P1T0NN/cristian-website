// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

const CACHE_TTL = 300; // 5 minutes in seconds

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const cacheKey = `${CACHE_KEYS.USER_PREFIX}${userId}`;

    // Try to get user data from cache first
    const cachedResult = await upstashRedisCacheService.get(cacheKey);
    if (cachedResult.success && cachedResult.data) {
        return NextResponse.json({ success: true, message: t('USER_DATA_SUCCESSFULLY_FETCHED'), data: cachedResult.data });
    }

    // If not in cache or cache error, fetch from database
    const { data, error: supabaseError } = await supabase
        .from('users')
        .select('id, email, fullName, phoneNumber, created_at, is_verified, isAdmin, gender')
        .eq('id', userId)
        .single();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: t('USER_DATA_FAILED_TO_FETCH') }, { status: 500 });
    }

    // Store the fetched data in cache
    await upstashRedisCacheService.set(cacheKey, data, CACHE_TTL);

    return NextResponse.json({ success: true, message: t('USER_DATA_SUCCESSFULLY_FETCHED'), data });
});