"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface PlayerToAdd {
    name: string;
    position: string;
}

interface AdminAddPlayerToMatchResponse {
    success: boolean;
    message: string;
    newPlacesOccupied?: number;
    playersAdded?: number;
}

interface AdminAddPlayerToMatchParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    players: PlayerToAdd[];
}

export const adminAddPlayerToMatch = async ({
    matchIdFromParams,
    teamNumber,
    players
}: AdminAddPlayerToMatchParams): Promise<AdminAddPlayerToMatchResponse> => {
    const t = await getTranslations("GenericMessages");

    // Verify authentication
    const { isAuth, userId } = await verifyAuth();
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || !players || players.length === 0) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Validate player names
    const validPlayers = players.filter(player => player.name.trim() !== '');
    if (validPlayers.length === 0) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
        .from("user")
        .select("isAdmin")
        .eq("id", userId)
        .single();

    if (adminError || !adminData || !adminData.isAdmin) {
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

    // Calculate max players based on match type
    let maxPlayers = 16; // Default to F8
    
    if (matchData.matchType === 'F7') {
        maxPlayers = 14;
    } else if (matchData.matchType === 'F8') {
        maxPlayers = 16;
    } else if (matchData.matchType === 'F11') {
        maxPlayers = 22;
    }

    // Get blocked spots for the team
    const blockedSpots = teamNumber === 1 
        ? (matchData.blockSpotsTeam1 || 0) 
        : (matchData.blockSpotsTeam2 || 0);

    // Check if match has enough space for all players
    const placesOccupied = matchData.placesOccupied || 0;
    const availableSpots = maxPlayers - blockedSpots - placesOccupied;
    
    if (availableSpots < validPlayers.length) {
        return { 
            success: false, 
            message: validPlayers.length === 1 
                ? t('MATCH_IS_FULL') 
                : t('NOT_ENOUGH_SPOTS_FOR_ALL_PLAYERS')
        };
    }

    // Prepare array for inserting multiple players
    const playersToInsert = validPlayers.map(player => ({
        id: crypto.randomUUID(),
        matchId: matchIdFromParams,
        userId: userId,
        playerType: 'temporary',
        teamNumber: teamNumber,
        temporaryPlayerName: player.name.trim(),
        temporaryPlayerPosition: player.position || null
    }));

    // Insert all players
    const { error: insertError } = await supabase
        .from("match_players")
        .insert(playersToInsert);

    if (insertError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Update places_occupied in the match
    const newPlacesOccupied = placesOccupied + validPlayers.length;
    const { data: updateData, error: updateError } = await supabase
        .from("matches")
        .update({ placesOccupied: newPlacesOccupied })
        .eq("id", matchIdFromParams)
        .select("placesOccupied")
        .single();

    if (updateError) {
        // If update fails, we should delete the players we just added
        const playerIds = playersToInsert.map(p => p.id);
        await supabase
            .from("match_players")
            .delete()
            .in("id", playerIds);
            
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);

    return { 
        success: true, 
        message: validPlayers.length > 1 
            ? t('MULTIPLE_PLAYERS_ADDED_SUCCESSFULLY') 
            : t('PLAYER_ADDED_SUCCESSFULLY'),
        newPlacesOccupied: updateData.placesOccupied,
        playersAdded: validPlayers.length
    };
};