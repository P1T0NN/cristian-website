"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface AddFriendResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        temporaryPlayerName: string;
        teamNumber: number;
        playerType: 'temporary';
        playerPosition: string; // This contains "Added by: [name]" or custom position
        temporaryPlayerPosition: string; // This is the actual position of the player
        hasPaid: boolean;
        hasGratis: boolean;
        hasDiscount: boolean;
        hasArrived: boolean;
        addedBy: string; // Name of the user who added the friend
    };
}

interface AddFriendParams {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    friendName: string;
    phoneNumber: string;
    playerPosition: string;
}

export const addFriend = async ({
    matchIdFromParams,
    teamNumber,
    friendName,
    phoneNumber,
    playerPosition
}: AddFriendParams): Promise<AddFriendResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();

    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || !friendName || !phoneNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }
    
    // Check if user has already added a friend
    const { data: playerData, error: playerError } = await supabase
        .from("match_players")
        .select("hasAddedFriend")
        .eq("matchId", matchIdFromParams)
        .eq("userId", userId)
        .eq("playerType", "regular")
        .single();
    
    if (playerError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    if (playerData.hasAddedFriend) {
        return { success: false, message: t('ALREADY_ADDED_FRIEND') };
    }
    
    // Fetch match details
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // Get user name who's adding the friend
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("name")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    const addedByName = userData.name;
    
    // Update places occupied
    const updatedPlacesOccupied = (matchData.placesOccupied || 0) + 1;
    
    // Generate unique ID for temporary player
    const tempPlayerId = crypto.randomUUID();
    
    // Insert temporary player
    const { data: tempPlayer, error: insertError } = await supabase
        .from("match_players")
        .insert({
            id: tempPlayerId,
            matchId: matchIdFromParams,
            userId: userId,
            teamNumber: teamNumber,
            playerType: 'temporary',
            temporaryPlayerName: friendName,
            temporaryPlayerPosition: playerPosition,
            substituteRequested: false,
            hasPaid: false,
            hasDiscount: false,
            hasGratis: false,
            hasMatchAdmin: false,
            hasAddedFriend: false,
            hasEnteredWithBalance: false,
            hasArrived: false
        })
        .select()
        .single();
    
    if (insertError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // Update places occupied
    const { error: updateMatchError } = await supabase
        .from("matches")
        .update({ placesOccupied: updatedPlacesOccupied })
        .eq("id", matchIdFromParams);
    
    if (updateMatchError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // Update hasAddedFriend status for the regular player
    const { error: updatePlayerError } = await supabase
        .from("match_players")
        .update({ hasAddedFriend: true })
        .eq("matchId", matchIdFromParams)
        .eq("userId", userId)
        .eq("playerType", "regular");
    
    if (updatePlayerError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);

    return { 
        success: true, 
        message: t('FRIEND_ADDED_SUCCESSFULLY'),
        data: {
            id: tempPlayer.id,
            temporaryPlayerName: tempPlayer.temporaryPlayerName,
            teamNumber: tempPlayer.teamNumber,
            playerType: tempPlayer.playerType,
            playerPosition: `Added by: ${addedByName}`, // This will be "Added by: [name]"
            temporaryPlayerPosition: tempPlayer.temporaryPlayerPosition, // The actual position
            hasPaid: tempPlayer.hasPaid,
            hasGratis: tempPlayer.hasGratis,
            hasDiscount: tempPlayer.hasDiscount,
            hasArrived: tempPlayer.hasArrived,
            addedBy: addedByName // The name of who added the friend
        }
    };
};