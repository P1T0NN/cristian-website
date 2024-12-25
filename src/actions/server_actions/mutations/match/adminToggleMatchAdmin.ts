"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// CONFIG
import { CACHE_KEYS } from '@/config';

export async function adminToggleMatchAdmin(
    authToken: string,
    matchId: string,
    playerId: string
) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
    
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !playerId) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Check if the authenticated user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (userError || !userData || !userData.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Fetch current match admin status
    const { data: currentStatus, error: statusError } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .match({ match_id: matchId, user_id: playerId })
        .single();

    if (statusError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Toggle the match admin status
    const newStatus = !currentStatus.has_match_admin;

    const { error: updateError } = await supabase
        .from('match_players')
        .update({ has_match_admin: newStatus })
        .match({ match_id: matchId, user_id: playerId });

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // If the new status is true, update the added_by column in the matches table
    if (newStatus) {
        // Fetch the user's full name
        const { data: playerData, error: playerError } = await supabase
            .from('users')
            .select('fullName')
            .eq('id', playerId)
            .single();

        if (playerError || !playerData) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }

        // Update the added_by column in the matches table
        const { error: matchUpdateError } = await supabase
            .from('matches')
            .update({ added_by: playerData.fullName })
            .eq('id', matchId);

        if (matchUpdateError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }

        // Update the cache
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
        const cachedMatch = await upstashRedisCacheService.get<{ added_by?: string }>(cacheKey);
        
        if (cachedMatch.success && cachedMatch.data) {
            const updatedCachedMatch = { 
                ...cachedMatch.data, 
                added_by: playerData.fullName
            };
            await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
        }
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages('MATCH_ADMIN_STATUS_UPDATED'),
        data: { newStatus }
    };
}