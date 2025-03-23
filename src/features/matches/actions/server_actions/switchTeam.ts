"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface SwitchTeamResponse {
    success: boolean;
    message: string;
}

interface SwitchTeamParams {
    matchIdFromParams: string;
    playerId: string;
    playerType: 'regular' | 'temporary';
}

export const switchTeam = async ({
    matchIdFromParams,
    playerId,
    playerType
}: SwitchTeamParams): Promise<SwitchTeamResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth();
                    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Verify match exists
    const { error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }
    
    // Get current team number
    const { data: playerData, error: playerError } = await supabase
        .from("match_players")
        .select("teamNumber")
        .eq("matchId", matchIdFromParams)
        .eq("id", playerId)
        .eq("playerType", playerType)
        .single();
    
    if (playerError) {
        return { success: false, message: t('PLAYER_NOT_FOUND_OR_NOT_IN_TEAM') };
    }
    
    // Only allow switching between teams 1 and 2
    if (playerData.teamNumber !== 1 && playerData.teamNumber !== 2) {
        return { success: false, message: t('PLAYER_NOT_IN_TEAM') };
    }
    
    // Calculate new team number
    const newTeamNumber = playerData.teamNumber === 1 ? 2 : 1;
    
    // Get match data to check team capacity
    const { data: matchData, error: matchDataError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();

    if (matchDataError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // Get current players in the destination team
    const { data: destinationTeamPlayers, error: teamPlayersError } = await supabase
        .from("match_players")
        .select("id")
        .eq("matchId", matchIdFromParams)
        .eq("teamNumber", newTeamNumber);

    if (teamPlayersError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    // Calculate max players based on match type
    const baseMaxPlayers = matchData.matchType === 'F7' ? 7 : 
                          matchData.matchType === 'F8' ? 8 : 
                          matchData.matchType === 'F11' ? 11 : 8; // Default to F8

    // Get extra spots for the destination team
    const extraSpots = newTeamNumber === 1 ? (matchData.extraSpotsTeam1 || 0) : (matchData.extraSpotsTeam2 || 0);

    // Get blocked spots for the destination team
    const blockedSpots = newTeamNumber === 1 
        ? (matchData.blockSpotsTeam1 || 0) 
        : (matchData.blockSpotsTeam2 || 0);

    // Calculate available spots in the destination team
    const currentTeamPlayers = destinationTeamPlayers?.length || 0;
    const effectiveMaxPlayers = baseMaxPlayers + extraSpots;
    const availableSpotsInTeam = effectiveMaxPlayers - blockedSpots - currentTeamPlayers;

    // Check if destination team has space
    if (availableSpotsInTeam <= 0) {
        return { success: false, message: t('TEAM_IS_FULL') };
    }
    
    // Update player's team
    const { error: updateError } = await supabase
        .from("match_players")
        .update({ teamNumber: newTeamNumber })
        .eq("matchId", matchIdFromParams)
        .eq("id", playerId)
        .eq("playerType", playerType);
    
    if (updateError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t('PLAYER_SWITCHED_TEAM_SUCCESSFULLY') 
    };
};