"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// UTILS
import { 
    restorePlayerBalance, 
    getPlayersEnteredWithBalance,
    checkMatchAdminPermissions
} from '../../utils/matchUtils';

interface CancelMatchResponse {
    success: boolean;
    message: string;
}

interface CancelMatchParams {
    matchIdFromParams: string;
}

export const cancelMatch = async ({
    matchIdFromParams
}: CancelMatchParams): Promise<CancelMatchResponse> => {
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
    
    // 5. Set match status to cancelled
    const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'cancelled' })
        .eq('id', matchIdFromParams);
    
    if (updateError) {
        console.error('Error updating match status:', updateError);
        return { success: false, message: t('MATCH_CANCELLATION_FAILED') };
    }
    
    // 6. Revalidate cache
    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);
    
    return { 
        success: true, 
        message: t('MATCH_CANCELED_SUCCESSFULLY')
    };
};