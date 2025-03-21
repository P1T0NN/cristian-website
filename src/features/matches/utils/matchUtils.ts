// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';

/**
 * Restores a player's balance after leaving a match or when a match is cancelled
 * @param playerId - Match player ID
 * @param userId - User ID in the user table
 * @param matchPrice - Price of the match to restore
 * @param currentBalance - Current user balance
 * @param hasEnteredWithBalance - Whether the player entered the match using their balance
 * @returns Object containing success status and the amount restored
 */
export const restorePlayerBalance = async ({
    userId,
    matchPrice,
    currentBalance,
    hasEnteredWithBalance
}: {
    userId: string;
    matchPrice: number;
    currentBalance: number;
    hasEnteredWithBalance: boolean;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<{ success: boolean; amountRestored: number; error?: any }> => {
    // Don't do anything if the player didn't enter with balance
    if (!hasEnteredWithBalance) {
        return { success: true, amountRestored: 0 };
    }

    // Get the user's current balance directly from the database 
    // This ensures we have the most recent value
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("balance")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { 
            success: false, 
            amountRestored: 0, 
            error: userError 
        };
    }

    // Determine the balance to restore
    const balanceToRestore = matchPrice;
    
    // Get the current balance from the database or use the passed value as fallback
    const currentDbBalance = userData?.balance !== null ? userData.balance : currentBalance;
    
    // Ensure we're working with numbers for the calculation
    const newBalance = Number(currentDbBalance) + Number(balanceToRestore);
    
    // Update user balance
    const { error: balanceError } = await supabase
        .from("user")
        .update({ balance: newBalance })
        .eq("id", userId);

    if (balanceError) {
        return { 
            success: false, 
            amountRestored: 0, 
            error: balanceError 
        };
    }

    return { 
        success: true, 
        amountRestored: balanceToRestore 
    };
};

/**
 * Fetches all players who entered a match using their balance
 * @param matchId - The match ID to check
 * @returns An object containing player data and a success status
 */
export const getPlayersEnteredWithBalance = async (matchId: string): Promise<{
    success: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    players: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
}> => {
    const { data: playersData, error: playersError } = await supabase
        .from('match_players')
        .select('*, user:userId(balance)')
        .eq('matchId', matchId)
        .eq('hasEnteredWithBalance', true);
    
    if (playersError) {
        return { 
            success: false, 
            players: [], 
            error: playersError 
        };
    }
    
    return {
        success: true,
        players: playersData || []
    };
};

/**
 * Checks if a user has admin permissions for a match
 * @param userId - The user ID to check
 * @param matchId - The match ID to check permissions for
 * @returns An object containing the permission check result
 */
export const checkMatchAdminPermissions = async (
    userId: string, 
    matchId: string
): Promise<{
    hasPermission: boolean;
    isGlobalAdmin: boolean;
    isMatchAdmin: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
}> => {
    // Check if user is a global admin
    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('isAdmin')
        .eq('id', userId)
        .single();
    
    if (userError) {
        return { 
            hasPermission: false, 
            isGlobalAdmin: false,
            isMatchAdmin: false,
            error: userError 
        };
    }
    
    const isGlobalAdmin = userData.isAdmin === true;
    
    // If user is a global admin, we can return early
    if (isGlobalAdmin) {
        return {
            hasPermission: true,
            isGlobalAdmin: true,
            isMatchAdmin: false
        };
    }
    
    // Check if user is a match admin
    const { data: matchAdminData, error: matchAdminError } = await supabase
        .from('match_players')
        .select('id')
        .eq('matchId', matchId)
        .eq('userId', userId)
        .eq('hasMatchAdmin', true)
        .maybeSingle();
    
    if (matchAdminError) {
        return { 
            hasPermission: false, 
            isGlobalAdmin: false,
            isMatchAdmin: false,
            error: matchAdminError 
        };
    }
    
    const isMatchAdmin = matchAdminData !== null;
    
    return {
        hasPermission: isGlobalAdmin || isMatchAdmin,
        isGlobalAdmin,
        isMatchAdmin
    };
}; 