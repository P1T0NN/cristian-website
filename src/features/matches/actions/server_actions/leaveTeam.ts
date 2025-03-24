"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// UTILS
import { restorePlayerBalance, checkMatchAdminPermissions } from '../../utils/matchUtils';
import { getCurrentDateTime } from '@/shared/utils/dateUtils';

interface LeaveMatchResponse {
    success: boolean;
    message: string;
    code?: string;
    canRequestSubstitute?: boolean;
    updatedPlacesOccupied?: number;
    balanceRestored?: number;
}

interface LeaveMatchParams {
    matchIdFromParams: string;
    isRemovingFriend?: boolean;
    adminOverride?: boolean;
    playerId?: string; // Only needed for admin override
}

export const leaveMatch = async ({
    matchIdFromParams,
    isRemovingFriend = false,
    adminOverride = false,
    playerId
}: LeaveMatchParams): Promise<LeaveMatchResponse> => {
    const t = await getTranslations("GenericMessages");

    // Authenticate user
    const { isAuth, userId: currentUserId } = await verifyAuth();

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if user is admin when admin override is requested
    if (adminOverride) {
        // Admin must specify a player ID
        if (!playerId) {
            return { success: false, message: t('BAD_REQUEST') };
        }
        
        // Ensure currentUserId is not null
        if (!currentUserId) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
        
        // Use our utility function to check admin permissions
        const permissionCheck = await checkMatchAdminPermissions(currentUserId, matchIdFromParams);
        
        if (!permissionCheck.hasPermission) {
            return { success: false, message: t('UNAUTHORIZED') };
        }
    }

    // Get match information
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();

    if (matchError || !matchData) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // Calculate time thresholds
    const currentTime = getCurrentDateTime();
    const matchStartTime = new Date(`${matchData.startsAtDay} ${matchData.startsAtHour}`);
    const eightHoursBeforeMatch = new Date(matchStartTime.getTime() - 8 * 60 * 60 * 1000);
    
    let player;

    // Three cases:
    // 1. Removing friend (isRemovingFriend = true)
    // 2. Player leaving themselves (normal case)
    // 3. Admin removing player (adminOverride = true)
    
    if (adminOverride) {
        // Case 3: Admin removing player
        const { data: playerData, error: playerError } = await supabase
            .from("match_players")
            .select("*")
            .eq("matchId", matchIdFromParams)
            .eq("id", playerId)
            .single();

        if (playerError || !playerData) {
            return { success: false, message: t('PLAYER_NOT_FOUND') };
        }

        player = playerData;
    } else if (isRemovingFriend) {
        // Case 1: Removing friend - we need to find the temporary player added by the current user
        const { data: playersData, error: playersError } = await supabase
            .from("match_players")
            .select("*")
            .eq("matchId", matchIdFromParams)
            .eq("userId", currentUserId)
            .eq("playerType", "temporary");

        if (playersError || !playersData || playersData.length === 0) {
            return { success: false, message: t('PLAYER_NOT_FOUND') };
        }

        // Find the temporary player (should only be one)
        const tempPlayer = playersData[0];

        if (!tempPlayer) {
            return { success: false, message: t('PLAYER_NOT_FOUND') };
        }

        player = tempPlayer;
    } else {
        // Case 2: Player leaving themselves
        const { data: playerData, error: playerError } = await supabase
            .from("match_players")
            .select("*")
            .eq("matchId", matchIdFromParams)
            .eq("userId", currentUserId)
            .eq("playerType", "regular")
            .single();

        if (playerError || !playerData) {
            return { success: false, message: t('PLAYER_NOT_FOUND') };
        }

        player = playerData;
    }

    // Check time limit for leaving (skip if admin override)
    if (!adminOverride && currentTime > eightHoursBeforeMatch) {
        return { 
            success: false, 
            message: t('TOO_LATE_TO_LEAVE'),
            code: 'TOO_LATE_TO_LEAVE',
            canRequestSubstitute: true
        };
    }

    // Handle friend removal special case
    if (isRemovingFriend) {
        // Update hasAddedFriend to false for the regular player
        const { error: updateError } = await supabase
            .from("match_players")
            .update({ hasAddedFriend: false })
            .eq("matchId", matchIdFromParams)
            .eq("userId", currentUserId)
            .eq("playerType", "regular");

        if (updateError) {
            console.error("Error updating regular player:", {
                matchId: matchIdFromParams,
                userId: currentUserId,
                error: updateError
            });
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }
    }

    // Handle balance restoration if player paid with balance
    let balanceRestored = 0;
    
    const balanceResult = await restorePlayerBalance({
        userId: player.userId,
        matchPrice: matchData.price,
        currentBalance: player.balance,
        hasEnteredWithBalance: player.hasEnteredWithBalance
    });
    
    if (!balanceResult.success) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    balanceRestored = balanceResult.amountRestored;

    // Delete the player from the match
    const { error: deleteError } = await supabase
        .from("match_players")
        .delete()
        .eq("id", player.id);

    if (deleteError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Update places occupied in the match
    const { data: updateData, error: updateError } = await supabase
        .from("matches")
        .update({ 
            placesOccupied: (matchData.placesOccupied || 0) - 1 
        })
        .eq("id", matchIdFromParams)
        .select("placesOccupied")
        .single();

    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath(`/matches/${matchIdFromParams}`);
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { 
        success: true, 
        message: t("PLAYER_LEFT_SUCCESSFULLY"), 
        code: 'PLAYER_LEFT_SUCCESSFULLY',
        updatedPlacesOccupied: updateData.placesOccupied,
        balanceRestored: balanceRestored
    };
};