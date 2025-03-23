import "server-only";

// LIBRARIES
import { getTranslations } from "next-intl/server";

// TYPES
import type { typesPlayer } from "../types/typesMatch";

interface AvailableSlot {
    isBlocked: boolean;
}

interface MatchStats {
    playersPaid: number;
    playersWithDiscount: number;
    playersWithGratis: number;
    playersEnteredWithBalance: number;
    playersNotPaid: number;
}

export const getMaxPlayers = (matchType: string) => {
    switch (matchType) {
        case "F8": return 8;
        case "F7": return 7;
        case "F11": return 11;
        default: return 0;
    }
};

// This function returns the base total places without considering extra spots
// It's kept for backwards compatibility with other parts of the code
export const getTotalPlaces = (matchType: string) => {
    switch (matchType) {
        case "F8": return 16;
        case "F7": return 14;
        case "F11": return 22;
        default: return 0;
    }
};

// Calculate the effective max players including extra spots
export const getEffectiveMaxPlayers = (
    matchType: string,
    extraSpots: number = 0
) => {
    return getMaxPlayers(matchType) + extraSpots;
};

export const calculateMatchPlaces = (match: {
    matchType: string;
    team1Name: string;
    team2Name: string;
    placesOccupied: number;
    extraSpotsTeam1?: number;
    extraSpotsTeam2?: number;
}) => {
    const baseTeamSize = getMaxPlayers(match.matchType);
    const extraSpotsTeam1 = match.extraSpotsTeam1 || 0;
    const extraSpotsTeam2 = match.extraSpotsTeam2 || 0;
    
    // Calculate total places including extra spots
    const totalPlaces = (baseTeamSize * 2) + extraSpotsTeam1 + extraSpotsTeam2;
    const placesPerTeam = baseTeamSize; // Base places per team without extras
    
    let occupiedPlaces = match.placesOccupied || 0;

    if (match.team1Name !== "Equipo 1") {
        occupiedPlaces += placesPerTeam;
    }
    if (match.team2Name !== "Equipo 2") {
        occupiedPlaces += placesPerTeam;
    }

    const finalOccupiedPlaces = Math.min(totalPlaces, occupiedPlaces);
    const placesLeft = Math.max(0, totalPlaces - finalOccupiedPlaces);

    return {
        totalPlaces,
        occupiedPlaces: finalOccupiedPlaces,
        placesLeft
    };
};

export const getPlacesLeftText = async (
    placesLeft: number,
    isAdmin: boolean
) => {
    const t = await getTranslations('MatchPage');

    if (placesLeft === 0) {
        return t('matchCompleted');
    } else if (placesLeft <= 3) {
        return t('lastPlacesLeft');
    } else {
        // Always show the exact number of places left for admin
        // or when there are more than standard number of places (due to extra spots)
        if (isAdmin || placesLeft > 16) {
            return `${placesLeft} ${t('placesLeft')}`;
        } else {
            return t('available');
        }
    }
};

export const getPlacesLeftColor = (placesLeft: number) => {
    return placesLeft <= 3 ? 'bg-red-500' : 'bg-blue-100';
};

export const calculateAvailableSlots = (
    maxPlayers: number,
    currentPlayers: number,
    blockedSpots: number,
    extraSpots: number = 0
): AvailableSlot[] => {
    // Calculate the effective max players with extra spots
    const effectiveMaxPlayers = maxPlayers + extraSpots;
    
    // Ensure we don't have negative available slots
    const availableSlots = Math.max(0, effectiveMaxPlayers - currentPlayers);
    
    return Array(availableSlots).fill(null).map((_, index) => ({
        isBlocked: index < blockedSpots
    }));
};

export const getTeamPlayersText = async (
    currentPlayers: number,
    matchType: string,
    blockedSpots: number = 0,
    extraSpots: number = 0
) => {
    const t = await getTranslations('MatchPage');

    const maxPlayers = getMaxPlayers(matchType);
    // Add extra spots to the calculation
    const effectiveMaxPlayers = maxPlayers + extraSpots;
    const availablePlayers = effectiveMaxPlayers - blockedSpots;
    
    if (availablePlayers <= 0 || currentPlayers >= availablePlayers) {
        return t('teamFull');
    }
    
    return `${currentPlayers}/${availablePlayers}`;
};

export const isTeamFull = (
    currentPlayers: number,
    matchType: string,
    blockedSpots: number = 0,
    extraSpots: number = 0
) => {
    const maxPlayers = getMaxPlayers(matchType);
    // Add extra spots to the calculation
    const effectiveMaxPlayers = maxPlayers + extraSpots;
    const availablePlayers = effectiveMaxPlayers - blockedSpots;
    return availablePlayers <= 0 || currentPlayers >= availablePlayers;
};

export const calculateMatchStats = (players: typesPlayer[]): MatchStats => {
    return {
        playersPaid: players.filter(player => player.hasPaid).length,
        playersWithDiscount: players.filter(player => player.hasDiscount).length,
        playersWithGratis: players.filter(player => player.hasGratis).length,
        playersEnteredWithBalance: players.filter(player => player.hasMatchAdmin).length,
        playersNotPaid: players.filter(player => !player.hasPaid).length,
    };
};