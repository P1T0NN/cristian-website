// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

type MatchType = string;

export async function formatMatchTypeLong(matchType: MatchType): Promise<string> {
    const locale = await getUserLocale();

    const formats: Record<MatchType, { en: string[], es: string[] }> = {
        'F11': { en: ['11v11', 'Soccer'], es: ['11v11', 'Fútbol'] },
        'F8': { en: ['8v8', 'Soccer'], es: ['8v8', 'Fútbol'] },
        'F7': { en: ['7v7', 'Soccer'], es: ['7v7', 'Fútbol'] },
        'F5': { en: ['5v5', 'Futsal'], es: ['5v5', 'Fútbol Sala'] },
    };

    const [top, bottom] = formats[matchType][locale === 'es' ? 'es' : 'en'];
    return `${top}\n${bottom}`;
}

export const getMaxPlayersByMatchType = (matchType: string): number => {
    const matchTypes: Record<string, number> = {
        'F11': 22, // 11v11
        'F8': 16,  // 8v8
        'F7': 14,  // 7v7
        'F5': 10   // 5v5
    };

    return matchTypes[matchType] || 0;
};

export const formatMatchTypeShort = (type: string) => {
    switch (type) {
        case "F8": return "8v8"
        case "F7": return "7v7"
        case "F11": return "11v11"
        default: return type
    }
};