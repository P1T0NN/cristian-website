"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// UTILS
import { checkMatchAdminPermissions } from '@/features/matches/utils/matchUtils';

interface RemoveExtraSpotsResponse {
    success: boolean;
    message: string;
    newExtraSpots?: number;
    totalTeamSpots?: number;
}

interface RemoveExtraSpotsParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    spotsToRemove: number; // Limited to 1-3
}

export const removeExtraSpots = async ({
    matchIdFromParams,
    teamNumber,
    spotsToRemove
}: RemoveExtraSpotsParams): Promise<RemoveExtraSpotsResponse> => {
    const t = await getTranslations("GenericMessages");

    // Verify authentication
    const { isAuth, userId } = await verifyAuth();
    
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Validate spotsToRemove is between 1 and 3
    if (spotsToRemove < 1 || spotsToRemove > 3) {
        return { success: false, message: t('SPOTS_REMOVE_INVALID_NUMBER') };
    }

    // Check if user has permission
    const permissionCheck = await checkMatchAdminPermissions(userId, matchIdFromParams);
    
    if (!permissionCheck.hasPermission) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Get match data
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();

    if (matchError || !matchData) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // Get current extra spots for the team
    const currentExtraSpots = teamNumber === 1 
        ? (matchData.extraSpotsTeam1 || 0) 
        : (matchData.extraSpotsTeam2 || 0);

    // Calculate new extra spots - ensure we don't go below 0
    const newExtraSpots = Math.max(currentExtraSpots - spotsToRemove, 0);
    
    // If we're already at 0, return an error
    if (currentExtraSpots <= 0) {
        return { success: false, message: t('NO_EXTRA_SPOTS_TO_REMOVE') };
    }

    // Get current players in the team to check if removing spots would affect existing players
    const { data: teamPlayers, error: teamPlayersError } = await supabase
        .from("match_players")
        .select("id")
        .eq("matchId", matchIdFromParams)
        .eq("teamNumber", teamNumber);

    if (teamPlayersError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Calculate base team size
    let baseTeamSpots = 8; // Default for F8
    
    if (matchData.matchType === 'F7') {
        baseTeamSpots = 7;
    } else if (matchData.matchType === 'F8') {
        baseTeamSpots = 8;
    } else if (matchData.matchType === 'F11') {
        baseTeamSpots = 11;
    }

    // Check if removing spots would affect existing players
    const currentPlayerCount = teamPlayers?.length || 0;
    if (currentPlayerCount > (baseTeamSpots + newExtraSpots)) {
        return { success: false, message: t('CANNOT_REMOVE_SPOTS_TEAM_HAS_PLAYERS') };
    }

    // Update match with new extra spots
    const updateData = teamNumber === 1 
        ? { extraSpotsTeam1: newExtraSpots } 
        : { extraSpotsTeam2: newExtraSpots };
    
    const { error: updateError } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchIdFromParams);

    if (updateError) {
        return { success: false, message: t('SPOTS_REMOVE_FAILED') };
    }

    const totalTeamSpots = baseTeamSpots + newExtraSpots;

    revalidatePath(`/matches/${matchIdFromParams}`);

    return { 
        success: true, 
        message: t('EXTRA_SPOTS_REMOVED_SUCCESSFULLY'),
        newExtraSpots,
        totalTeamSpots
    };
}; 