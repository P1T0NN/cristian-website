// SERVICES
import { getUserLocale } from "@/shared/services/server/locale";

type MatchType = string;

export async function formatMatchType(matchType: MatchType): Promise<string> {
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