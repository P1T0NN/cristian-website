"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesMatch } from '@/types/typesMatch';

interface AdminToggleMatchAdminResponse {
    success: boolean;
    message: string;
    data?: {
        newStatus: boolean;
    };
}

interface AdminToggleMatchAdminParams {
    matchIdFromParams: string;
    playerId: string;
}

export async function adminToggleMatchAdmin({
    matchIdFromParams,
    playerId
}: AdminToggleMatchAdminParams): Promise<AdminToggleMatchAdminResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId } = await verifyAuth(authToken as string);
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !playerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if the authenticated user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (userError || !userData || !userData.isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Fetch current match admin status
    const { data: currentStatus, error: statusError } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .match({ match_id: matchIdFromParams, user_id: playerId })
        .single();

    if (statusError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Toggle the match admin status
    const newStatus = !currentStatus.has_match_admin;

    const { error: updateError } = await supabase
        .from('match_players')
        .update({ has_match_admin: newStatus })
        .match({ match_id: matchIdFromParams, user_id: playerId });

    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
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
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }

        // Update the added_by column in the matches table
        const { error: matchUpdateError } = await supabase
            .from('matches')
            .update({ added_by: playerData.fullName })
            .eq('id', matchIdFromParams);

        if (matchUpdateError) {
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }

        // Update the cache
        const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
        const cachedMatch = await upstashRedisCacheService.get<typesMatch>(cacheKey);
        
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
        message: t('MATCH_ADMIN_STATUS_UPDATED'),
        data: { newStatus }
    };
}