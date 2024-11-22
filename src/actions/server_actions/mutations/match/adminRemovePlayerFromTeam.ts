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

export async function adminRemovePlayerFromMatch(authToken: string, matchId: string, playerId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    // Check if the user is an admin
    const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', payload.sub)
        .single();

    if (adminError) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!adminUser || !adminUser.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Fetch current match data and remove player in parallel
    const [{ data: match, error: matchError }, { error: removeError }] = await Promise.all([
        supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single(),
        supabase
            .from('match_players')
            .delete()
            .match({ 
                match_id: matchId, 
                user_id: playerId 
            })
    ]);

    if (matchError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    if (removeError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Update places_occupied in the database
    let updatedPlacesOccupied = match.places_occupied;
    if (match && match.places_occupied > 0) {
        updatedPlacesOccupied = match.places_occupied - 1;
        const { error: updateError } = await supabase
            .from('matches')
            .update({ places_occupied: updatedPlacesOccupied })
            .eq('id', matchId);

        if (updateError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    }

    // Update the cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<typeof match>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('PLAYER_REMOVED_SUCCESSFULLY') };
}