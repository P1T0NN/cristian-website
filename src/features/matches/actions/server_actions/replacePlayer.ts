"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// UTILS
import { getCurrentDateTime } from '@/shared/utils/dateUtils';

interface ReplacePlayerResponse {
    success: boolean;
    message: string;
}

interface ReplacePlayerParams {
    matchIdFromParams: string;
    playerToReplaceId: string;
    withBalance: boolean;
}

export const replacePlayer = async ({
    matchIdFromParams,
    playerToReplaceId,
    withBalance
}: ReplacePlayerParams): Promise<ReplacePlayerResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
                
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !playerToReplaceId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Get match details
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }
    
    // Get player requesting substitute
    const { error: playerError } = await supabase
        .from("match_players")
        .select("*")
        .eq("id", playerToReplaceId)
        .eq("matchId", matchIdFromParams)
        .single();
    
    if (playerError) {
        return { success: false, message: t('PLAYER_NOT_IN_MATCH') };
    }
    
    // Get user details
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { success: false, message: t('USER_NOT_FOUND') };
    }
    
    // Check time limit
    const currentTime = getCurrentDateTime();
    const matchStart = new Date(`${matchData.startsAtDay} ${matchData.startsAtHour}`);
    
    if (currentTime > matchStart) {
        return { success: false, message: t('MATCH_ALREADY_STARTED') };
    }
    
    // Handle balance payment
    let hasEnteredWithBalance = false;
    
    if (withBalance) {
        if (userData.balance >= matchData.price) {
            // Deduct balance from new player
            const { error: balanceError } = await supabase
                .from("user")
                .update({ balance: userData.balance - matchData.price })
                .eq("id", userId);
            
            if (balanceError) {
                return { success: false, message: t('INTERNAL_SERVER_ERROR') };
            }
            
            hasEnteredWithBalance = true;
        } else {
            return { success: false, message: t('INSUFFICIENT_BALANCE_TRY_CASH') };
        }
    }
    
    // Update the player record with the new player
    const { error: updateError } = await supabase
        .from("match_players")
        .update({
            userId: userId,
            substituteRequested: false,
            playerType: 'regular',
            hasEnteredWithBalance: hasEnteredWithBalance
        })
        .eq("id", playerToReplaceId);
    
    if (updateError) {
        // If there was an error, refund the balance if needed
        if (hasEnteredWithBalance) {
            await supabase
                .from("user")
                .update({ balance: userData.balance })
                .eq("id", userId);
        }
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { 
        success: true, 
        message: t('PLAYER_REPLACED_SUCCESSFULLY')
    };
};