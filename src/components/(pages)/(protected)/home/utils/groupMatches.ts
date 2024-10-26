// LIBRARIES
import { parseISO, isToday, isTomorrow } from 'date-fns';

// TYPES
import type { typesMatch } from "@/types/typesMatch";

type GroupedMatches = {
    today: typesMatch[];
    tomorrow: typesMatch[];
    future: typesMatch[];
};

export const groupMatches = (matches: typesMatch[]): GroupedMatches => {
    return matches.reduce((acc: GroupedMatches, match) => {
        const matchDate = parseISO(match.starts_at_day);
        
        if (isToday(matchDate)) {
            acc.today.push(match);
        } else if (isTomorrow(matchDate)) {
            acc.tomorrow.push(match);
        } else {
            acc.future.push(match);
        }
        
        return acc;
    }, { today: [], tomorrow: [], future: [] });
};