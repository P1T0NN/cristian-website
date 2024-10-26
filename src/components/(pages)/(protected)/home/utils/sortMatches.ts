// LIBRARIES
import { compareAsc, parseISO } from 'date-fns';

// TYPES
import type { typesMatch } from "@/types/typesMatch";

export const sortMatchesByDate = (matches: typesMatch[]): typesMatch[] => {
    return [...matches].sort((a, b) => 
        compareAsc(parseISO(a.starts_at_day), parseISO(b.starts_at_day))
    );
};