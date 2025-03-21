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

interface AddExtraSpotsResponse {
    success: boolean;
    message: string;
    newExtraSpots?: number;
    totalTeamSpots?: number;
}

interface AddExtraSpotsParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    spotsToAdd: number; // Limited to 1-3
}

export const addExtraSpots = async ({
    matchIdFromParams,
    teamNumber,
    spotsToAdd
}: AddExtraSpotsParams): Promise<AddExtraSpotsResponse> => {
    const t = await getTranslations("GenericMessages");

    // Verify authentication
    const { isAuth, userId } = await verifyAuth();
    
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Validate spotsToAdd is between 1 and 3
    if (spotsToAdd < 1 || spotsToAdd > 3) {
        return { success: false, message: t('SPOTS_ADD_INVALID_NUMBER') };
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

    // Calculate new extra spots - ensure we don't exceed 3 extra spots per team
    const newExtraSpots = Math.min(currentExtraSpots + spotsToAdd, 3);
    
    // If we're already at the maximum, return an error
    if (currentExtraSpots >= 3) {
        return { success: false, message: t('MAX_EXTRA_SPOTS_REACHED') };
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
        return { success: false, message: t('SPOTS_ADD_FAILED') };
    }

    // Calculate total spots for this team based on match type
    let baseTeamSpots = 8; // Default for F8
    
    if (matchData.matchType === 'F7') {
        baseTeamSpots = 7;
    } else if (matchData.matchType === 'F8') {
        baseTeamSpots = 8;
    } else if (matchData.matchType === 'F11') {
        baseTeamSpots = 11;
    }

    const totalTeamSpots = baseTeamSpots + newExtraSpots;

    revalidatePath(`/matches/${matchIdFromParams}`);

    return { 
        success: true, 
        message: t('EXTRA_SPOTS_ADDED_SUCCESSFULLY'),
        newExtraSpots,
        totalTeamSpots
    };
}; 