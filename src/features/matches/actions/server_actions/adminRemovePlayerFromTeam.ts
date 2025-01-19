"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesMatch } from '../../types/typesMatch';

interface AdminRemovePlayerFromMatchResponse {
    success: boolean;
    message: string;
}

interface AdminRemovePlayerFromMatchParams {
    matchIdFromParams: string;
    playerId: string;
    isTemporaryPlayer?: boolean;
}

export async function adminRemovePlayerFromMatch({
    matchIdFromParams,
    playerId,
    isTemporaryPlayer = false
}: AdminRemovePlayerFromMatchParams): Promise<AdminRemovePlayerFromMatchResponse> {
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

    // Check if the user is an admin
    const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (adminError || !adminUser || !adminUser.isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Fetch current match data
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchIdFromParams)
        .single();

    if (matchError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    let removeError;
    if (isTemporaryPlayer) {
        // Remove temporary player from match
        const { error } = await supabase
            .from('temporary_players')
            .delete()
            .match({ 
                match_id: matchIdFromParams, 
                id: playerId 
            });
        removeError = error;
    } else {
        // Fetch player data for regular players
        const { data: player, error: playerError } = await supabase
            .from('match_players')
            .select('has_entered_with_balance')
            .eq('match_id', matchIdFromParams)
            .eq('user_id', playerId)
            .single();

        if (playerError) {
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }

        // Remove regular player from match
        const { error } = await supabase
            .from('match_players')
            .delete()
            .match({ 
                match_id: matchIdFromParams, 
                user_id: playerId 
            });
        removeError = error;

        // Update player's balance if they had entered with balance
        if (player && player.has_entered_with_balance) {
            const { error: balanceUpdateError } = await supabase.rpc('refund_player', {
                p_user_id: playerId,
                p_match_id: matchIdFromParams
            });

            if (balanceUpdateError) {
                return { success: false, message: t('BALANCE_UPDATE_FAILED') };
            }
        }
    }

    if (removeError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Update places_occupied in the database
    const updatedPlacesOccupied = match.places_occupied > 0 ? match.places_occupied - 1 : 0;
    const { error: updateError } = await supabase
        .from('matches')
        .update({ places_occupied: updatedPlacesOccupied })
        .eq('id', matchIdFromParams);

    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    const cachedMatch = await upstashRedisCacheService.get<typesMatch>(matchCacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(matchCacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: isTemporaryPlayer ? t('TEMPORARY_PLAYER_REMOVED_SUCCESSFULLY') : t('PLAYER_REMOVED_SUCCESSFULLY') };
}