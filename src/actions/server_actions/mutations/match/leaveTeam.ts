"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function leaveMatch(authToken: string, matchId: string) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    let authUserId: string;
    try {
        const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
        if (!payload || typeof payload.sub !== 'string') {
            return { success: false, message: t('JWT_DECODE_ERROR') };
        }
        authUserId = payload.sub;
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const { data, error } = await supabase.rpc('leave_match', {
        p_auth_user_id: authUserId,
        p_match_id: matchId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: t('PLAYER_LEAVE_FAILED'), metadata: result.metadata };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedMatch = await upstashRedisCacheService.get<any>(matchCacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedPlacesOccupied = cachedMatch.data.places_occupied > 0 ? cachedMatch.data.places_occupied - 1 : 0;
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(matchCacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: t("PLAYER_LEFT_SUCCESSFULLY"), metadata: data };
}