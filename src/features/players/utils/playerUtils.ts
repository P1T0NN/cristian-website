// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

// TYPES
import type { 
    typesPlayer, 
    typesUser, 
    typesRegularPlayer, 
    typesTemporaryPlayer,
    typesBaseMatchPlayer 
} from "../types/typesPlayer";

export const formatPlayerPositionLocalized = async (position: string) => {
    const locale = await getUserLocale();

    if (locale === "es") {
        switch (position) {
            case "Goalkeeper":
                return "Portero";
            case "Defender":
                return "Defensa";
            case "Middle":
                return "Centrocampista";
            case "Forward":
                return "Delantero";
            default:
                return position;
        }
    }
    return position;
};

export const formatPlayerInitials = (fullName: string): string => {
    if (!fullName) return '';

    // Split the name into words and filter out empty strings
    const words = fullName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return '';
    
    if (words.length === 1) {
        // If only one word, return first letter
        return words[0].charAt(0).toUpperCase();
    } else {
        // Take first letter of first word and first letter of last word
        // This handles cases of 2 or more words
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    }
};

export const isRegularPlayer = (player: typesPlayer): player is typesRegularPlayer => {
    return player.type === 'regular';
};

export const isTemporaryPlayer = (player: typesPlayer): player is typesTemporaryPlayer => {
    return player.type === 'temporary';
};

export const hasAddedFriend = (player: typesPlayer | null): boolean => {
    if (!player) return false;
    return isRegularPlayer(player) ? player.matchPlayer?.has_added_friend : false;
};

export const formatPlayerDisplayName = (player: typesPlayer): string => {
    if (isRegularPlayer(player)) {
        return player.user.fullName;
    }
    // For temporary players, use their name
    return player.temporary_player_name;
};

export function getPlayerTeamInfo(player: typesPlayer) {
    return {
        teamNumber: player.teamNumber,
        substituteRequested: player.substituteRequested,
        isMatchAdmin: isRegularPlayer(player) ? player.matchPlayer?.has_match_admin : false,
        hasPaid: isRegularPlayer(player) ? player.matchPlayer?.has_paid : false,
        hasDiscount: isRegularPlayer(player) ? player.matchPlayer?.has_discount : false,
        hasGratis: isRegularPlayer(player) ? player.matchPlayer?.has_gratis : false
    };
}

export function mapPlayerFromDatabase(
    user: typesUser | null,
    matchPlayer: typesBaseMatchPlayer
): typesPlayer {
    const basePlayer = {
        id: matchPlayer.id,
        teamNumber: matchPlayer.team_number,
        substituteRequested: matchPlayer.substitute_requested,
        matchId: matchPlayer.matchId
    };

    if (matchPlayer.player_type === 'regular' && user) {
        return {
            ...basePlayer,
            type: 'regular' as const,
            user,
            matchPlayer
        };
    } else {
        return {
            ...basePlayer,
            type: 'temporary' as const,
            temporary_player_name: matchPlayer.temporary_player_name || 'Unknown Player',
            phoneNumber: '',
            matchPlayer
        };
    }
}