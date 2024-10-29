// TYPES
import type { typesMatch } from "@/types/typesMatch";
import type { FilterValues } from "../filter-modal";

export const filterMatches = (matches: typesMatch[], filters: FilterValues): typesMatch[] => {
    return matches.filter(match => {
        if (filters.location && !match.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        if (filters.price && Number(match.price) > Number(filters.price)) return false;
        if (filters.date && match.starts_at_day !== filters.date) return false;

        const matchTime = match.starts_at_hour;
        if (filters.timeFrom || filters.timeTo) {
            if (filters.timeFrom && !filters.timeTo && matchTime < filters.timeFrom) return false;
            if (!filters.timeFrom && filters.timeTo && matchTime > filters.timeTo) return false;
            if (filters.timeFrom && filters.timeTo && (matchTime < filters.timeFrom || matchTime > filters.timeTo)) return false;
        }

        if (filters.gender && match.match_gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
        if (filters.matchType && match.match_type.toLowerCase() !== filters.matchType.toLowerCase()) return false;

        return true;
    });
};