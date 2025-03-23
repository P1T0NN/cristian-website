"use server"

// NEXTJS IMPORTS
import { revalidateTag, revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// UTILS
import { restorePlayerBalance } from '@/features/matches/utils/matchUtils';

interface JoinMatchResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        userId: string;
        name: string;
        hasMatchAdmin: boolean;
        hasPaid: boolean;
        hasDiscount: boolean;
        hasGratis: boolean;
        hasEnteredWithBalance: boolean;
        playerType: 'regular' | 'temporary';
        playerPosition: string;
    }
}

interface JoinMatchParams {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    withBalance: boolean;
}

export const joinMatch = async ({
    matchIdFromParams,
    teamNumber,
    withBalance
}: JoinMatchParams): Promise<JoinMatchResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
            
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
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
    
    // Get user details
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { success: false, message: t('USER_NOT_FOUND') };
    }
    
    // Check if player is already in match
    const { data: existingPlayer, error: existingError } = await supabase
        .from("match_players")
        .select("id")
        .eq("matchId", matchIdFromParams)
        .eq("userId", userId);
    
    if (existingError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    if (existingPlayer && existingPlayer.length > 0) {
        return { success: false, message: t('PLAYER_ALREADY_IN_MATCH') };
    }
    
    // Calculate updated places occupied
    const updatedPlacesOccupied = (matchData.placesOccupied || 0) + 1;
    
    // Generate a unique ID for the player
    const playerId = crypto.randomUUID();
    
    let hasEnteredWithBalance = false;
    let updatedBalance = userData.balance;
    
    // Handle balance payment
    if (withBalance) {
        if (userData.balance >= matchData.price) {
            // Update user balance
            updatedBalance = userData.balance - matchData.price;
            const { error: balanceError } = await supabase
                .from("user")
                .update({ balance: updatedBalance })
                .eq("id", userId);
            
            if (balanceError) {
                return { success: false, message: t('INTERNAL_SERVER_ERROR') };
            }
            
            hasEnteredWithBalance = true;
        } else {
            return { success: false, message: t('INSUFFICIENT_BALANCE_TRY_CASH') };
        }
    }
    
    // Insert player into match
    const playerData = {
        id: playerId,
        matchId: matchIdFromParams,
        userId: userId,
        teamNumber: teamNumber,
        hasPaid: false,
        hasEnteredWithBalance: hasEnteredWithBalance,
        playerType: 'regular'
    };
    
    const { data: player, error: insertError } = await supabase
        .from("match_players")
        .insert(playerData)
        .select()
        .single();
    
    if (insertError) {
        // If there was an error, refund the balance if needed
        if (hasEnteredWithBalance) {
            await restorePlayerBalance({
                userId,
                matchPrice: matchData.price,
                currentBalance: userData.balance,
                hasEnteredWithBalance: true
            });
        }
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // Update match places occupied
    const { error: updateError } = await supabase
        .from("matches")
        .update({ placesOccupied: updatedPlacesOccupied })
        .eq("id", matchIdFromParams);
    
    if (updateError) {
        return { success: false, message: t('MATCH_UPDATE_FAILED') };
    }

    revalidatePath("/");
    revalidatePath(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}`);
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { 
        success: true, 
        message: t("PLAYER_JOINED_SUCCESSFULLY"),
        data: {
            id: player.id,
            userId: userId,
            name: userData.name,
            hasMatchAdmin: false,
            hasPaid: false,
            hasDiscount: false,
            hasGratis: false,
            hasEnteredWithBalance: hasEnteredWithBalance,
            playerType: 'regular',
            playerPosition: userData.position || ''
        }
    };
};