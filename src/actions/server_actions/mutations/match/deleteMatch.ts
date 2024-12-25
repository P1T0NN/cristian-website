"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// In match_players table when we delete match we run this SQL:
//  ALTER TABLE match_players
//  ADD CONSTRAINT fk_match_players_match
//  FOREIGN KEY (match_id) REFERENCES matches(id)
//  ON DELETE CASCADE;
// So now when we delete match all associated rows will be deleted, so do not worry about cleaning up in code manually other tables (rows)

/* Same goes for temporary_players table
ALTER TABLE temporary_players
ADD CONSTRAINT fk_temporary_players_match
FOREIGN KEY (match_id) REFERENCES matches(id)
ON DELETE CASCADE;
*/

export async function deleteMatch(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
    
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    // Fetch match details
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('price')
        .eq('id', matchId)
        .single();

    if (matchError || !match) {
        return { success: false, message: genericMessages('MATCH_FETCH_FAILED') };
    }

    // Fetch players who joined with balance
    const { data: players, error: playersError } = await supabase
        .from('match_players')
        .select('user_id')
        .eq('match_id', matchId)
        .eq('has_entered_with_balance', true);

    if (playersError) {
        return { success: false, message: genericMessages('PLAYERS_FETCH_FAILED') };
    }

    // Refund players
    if (players && players.length > 0) {
        const refundPromises = players.map(player => 
            supabase.rpc('refund_player', {
                p_user_id: player.user_id,
                p_match_id: matchId
            })
        );

        const refundResults = await Promise.all(refundPromises);
        const refundErrors = refundResults.filter(result => result.error);

        if (refundErrors.length > 0) {
            return { success: false, message: genericMessages('REFUND_FAILED') };
        }
    }

    // Delete the match
    const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

    if (deleteError) {
        return { success: false, message: genericMessages('MATCH_DELETION_FAILED') };
    }

    // Delete the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);


    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_DELETED") };
}