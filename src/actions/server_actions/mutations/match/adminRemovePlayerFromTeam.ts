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

export async function adminRemovePlayerFromMatch(authToken: string, matchId: string, playerId: string, isTemporaryPlayer: boolean = false) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
    
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !playerId) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Check if the user is an admin
    const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (adminError || !adminUser || !adminUser.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Fetch current match data
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

    if (matchError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    let removeError;
    if (isTemporaryPlayer) {
        // Remove temporary player from match
        const { error } = await supabase
            .from('temporary_players')
            .delete()
            .match({ 
                match_id: matchId, 
                id: playerId 
            });
        removeError = error;
    } else {
        // Fetch player data for regular players
        const { data: player, error: playerError } = await supabase
            .from('match_players')
            .select('has_entered_with_balance')
            .eq('match_id', matchId)
            .eq('user_id', playerId)
            .single();

        if (playerError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }

        // Remove regular player from match
        const { error } = await supabase
            .from('match_players')
            .delete()
            .match({ 
                match_id: matchId, 
                user_id: playerId 
            });
        removeError = error;

        // Update player's balance if they had entered with balance
        if (player && player.has_entered_with_balance) {
            const { error: balanceUpdateError } = await supabase.rpc('refund_player', {
                p_user_id: playerId,
                p_match_id: matchId
            });

            if (balanceUpdateError) {
                return { success: false, message: genericMessages('BALANCE_UPDATE_FAILED') };
            }
        }
    }

    if (removeError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Update places_occupied in the database
    const updatedPlacesOccupied = match.places_occupied > 0 ? match.places_occupied - 1 : 0;
    const { error: updateError } = await supabase
        .from('matches')
        .update({ places_occupied: updatedPlacesOccupied })
        .eq('id', matchId);

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Update the match cache
    const matchCacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<typeof match>(matchCacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(matchCacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { success: true, message: isTemporaryPlayer ? genericMessages('TEMPORARY_PLAYER_REMOVED_SUCCESSFULLY') : genericMessages('PLAYER_REMOVED_SUCCESSFULLY') }
}