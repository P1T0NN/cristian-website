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

    // Get match data
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();

    if (matchError || !matchData) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // Get current players in the selected team
    const { data: teamPlayers, error: teamPlayersError } = await supabase
        .from("match_players")
        .select("id")
        .eq("matchId", matchIdFromParams)
        .eq("teamNumber", teamNumber);

    if (teamPlayersError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Calculate max players based on match type and extra spots
    const baseMaxPlayers = matchData.matchType === 'F7' ? 7 : 
                           matchData.matchType === 'F8' ? 8 : 
                           matchData.matchType === 'F11' ? 11 : 8; // Default to F8
                           
    // Get the extra spots for the specific team
    const extraSpots = teamNumber === 1 ? (matchData.extraSpotsTeam1 || 0) : (matchData.extraSpotsTeam2 || 0);

    // Get blocked spots for the team
    const blockedSpots = teamNumber === 1 
        ? (matchData.blockSpotsTeam1 || 0) 
        : (matchData.blockSpotsTeam2 || 0);

    // Calculate available spots in the team
    const currentTeamPlayers = teamPlayers?.length || 0;
    const effectiveMaxPlayers = baseMaxPlayers + extraSpots;
    const availableSpotsInTeam = effectiveMaxPlayers - blockedSpots - currentTeamPlayers;

    // Validate player names
    const validPlayers = players.filter(player => player.name.trim() !== '');
    if (validPlayers.length === 0) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if we have enough spots for all players
    if (availableSpotsInTeam < validPlayers.length) {
        return { 
            success: false, 
            message: validPlayers.length === 1 
                ? t('MATCH_IS_FULL') 
                : t('NOT_ENOUGH_SPOTS_FOR_ALL_PLAYERS')
        };
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
    const newPlacesOccupied = matchData.placesOccupied + validPlayers.length;
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