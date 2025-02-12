// TYPES
import type { typesMatchStatus } from './typesMatch';

export type typesAddMatchForm = {
    location: string;
    locationUrl: string;
    price: string;
    team1Name: string;
    team2Name: string;
    startsAtDay: string;
    startsAtHour: string;
    matchType: string;
    matchGender: string;
    matchDuration: number;
    addedBy: string;
    matchLevel: string;
    status: typesMatchStatus;
    hasTeams?: boolean;
}