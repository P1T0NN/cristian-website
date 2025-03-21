"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// UTILS
import { 
    restorePlayerBalance, 
    getPlayersEnteredWithBalance,
    checkMatchAdminPermissions
} from '../../utils/matchUtils';

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

interface DeleteMatchResponse {
    success: boolean;
    message: string;
}

interface DeleteMatchParams {
    matchIdFromParams: string;
}

export const deleteMatch = async ({
    matchIdFromParams
}: DeleteMatchParams): Promise<DeleteMatchResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId: currentUserId } = await verifyAuth();
        
    if (!isAuth || !currentUserId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // 1. Verify admin permissions (either global admin or match admin)
    const permissionCheck = await checkMatchAdminPermissions(currentUserId, matchIdFromParams);
    
    if (!permissionCheck.hasPermission) {
        if (permissionCheck.error) {
            console.error('Error checking admin permissions:', permissionCheck.error);
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }
        return { success: false, message: t('UNAUTHORIZED') };
    }
    
    // 2. Get match details
    const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchIdFromParams)
        .single();
    
    if (matchError || !matchData) {
        console.error('Error fetching match:', matchError);
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }
    
    // 3. Get all players who entered with balance
    const playersResult = await getPlayersEnteredWithBalance(matchIdFromParams);
    
    if (!playersResult.success) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // 4. Refund all players who entered with balance
    for (const player of playersResult.players) {
        const balanceResult = await restorePlayerBalance({
            userId: player.userId,
            matchPrice: matchData.price,
            currentBalance: player.user.balance,
            hasEnteredWithBalance: true // We already filtered for hasEnteredWithBalance=true
        });
        
        if (!balanceResult.success) {
            console.error('Error restoring balance for player:', player.userId);
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }
    }
    
    // 5. Delete the match (cascade will delete match_players)
    const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchIdFromParams);
    
    if (deleteError) {
        console.error('Error deleting match:', deleteError);
        return { success: false, message: t('MATCH_DELETION_FAILED') };
    }
    
    // 6. Revalidate cache
    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);
    
    return { 
        success: true, 
        message: t('MATCH_DELETED_SUCCESSFULLY')
    };
};