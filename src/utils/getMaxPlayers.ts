// TYPES
import type { typesUser } from "@/types/typesUser";

export const getMaxPlayers = (type: string, isPlayerList: boolean = false): number => {
    if (isPlayerList) {
        switch (type) {
        case 'F7':
            return 14;
        case 'F8':
            return 16;
        case 'F11':
            return 22;
        default:
            return 22;
        }
    } else {
        switch (type) {
        case 'F7':
            return 7;
        case 'F8':
            return 8;
        case 'F11':
            return 11;
        default:
            return 11;
        }
    }
};

export const isDefaultTeam = (teamName: string): boolean => {
    return teamName === "Equipo 1" || teamName === "Equipo 2";
};

export const getCurrentPlayers = (players: typesUser[] | undefined): number => {
    return players?.length ?? 0;
};

export const isTeamFull = (currentPlayers: number, availablePlaces: number): boolean => {
    return currentPlayers >= availablePlaces;
};

export const getBlockedSpots = (teamNumber: 1 | 2, blockSpotsTeam1: number, blockSpotsTeam2: number): number => {
    return teamNumber === 1 ? blockSpotsTeam1 : blockSpotsTeam2;
};

export const getTeamStatus = (
    players: typesUser[] | undefined, 
    matchType: string, 
    blockSpotsTeam1: number,
    blockSpotsTeam2: number,
    teamName?: string | undefined,
) => {
    const isPlayerList = !teamName;
    const defaultTeam = teamName ? isDefaultTeam(teamName) : false;
    const maxPlayers = getMaxPlayers(matchType, isPlayerList);
    const currentPlayers = getCurrentPlayers(players);

    let availablePlaces: number;
    let blockedSpots: number;

    if (isPlayerList) {
        blockedSpots = blockSpotsTeam1 + blockSpotsTeam2;
        availablePlaces = Math.max(maxPlayers - blockedSpots, 0);
    } else if (defaultTeam) {
        blockedSpots = teamName === "Equipo 1" ? blockSpotsTeam1 : blockSpotsTeam2;
        availablePlaces = Math.max(maxPlayers - blockedSpots, 0);
    } else {
        availablePlaces = maxPlayers;
        blockedSpots = 0;
    }

    const full = isTeamFull(currentPlayers, availablePlaces);

    return {
        isDefaultTeam: defaultTeam,
        maxPlayers: availablePlaces,
        currentPlayers,
        isFull: full,
        blockedSpots
    };
};