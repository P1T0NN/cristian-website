"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface BlockSpotsResponse {
    success: boolean;
    message: string;
    updatedPlacesOccupied?: number;
    blockedSpots?: number;
}

interface BlockSpotsParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    spotsToBlock: number;
}

export const blockSpots = async ({
    matchIdFromParams,
    teamNumber,
    spotsToBlock
}: BlockSpotsParams): Promise<BlockSpotsResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId } = await verifyAuth();
        
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || typeof spotsToBlock !== 'number') {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if the user is an admin
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("isAdmin")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    if (!userData.isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }
    
    // Get the current match data
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }
    
    // Get the current blocked spots
    const currentBlockedSpots = teamNumber === 1 
        ? matchData.blockSpotsTeam1 || 0 
        : matchData.blockSpotsTeam2 || 0;
    
    // Calculate the difference in blocked spots
    const spotsDifference = spotsToBlock - currentBlockedSpots;
    
    // Update places_occupied
    const updatedPlacesOccupied = Math.max(0, (matchData.placesOccupied || 0) + spotsDifference);
    
    // Update the blocked spots and places_occupied
    const updateData = {
        placesOccupied: updatedPlacesOccupied,
        ...(teamNumber === 1 
            ? { blockSpotsTeam1: spotsToBlock } 
            : { blockSpotsTeam2: spotsToBlock })
    };
    
    const { error: updateError } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchIdFromParams);
    
    if (updateError) {
        return { success: false, message: t('SPOTS_BLOCK_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t('SPOTS_BLOCKED_SUCCESSFULLY'),
        updatedPlacesOccupied,
        blockedSpots: spotsToBlock
    };
};