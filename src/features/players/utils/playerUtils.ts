// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

export const formatPlayerPositionLocalizedSync = (position: string, locale: string) => {
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

export const formatPlayerInitials = (name: string): string => {
    if (!name) return '';

    // Split the name into words and filter out empty strings
    const words = name.split(' ').filter(word => word.length > 0);
    
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