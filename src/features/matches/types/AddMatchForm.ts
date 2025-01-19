// TYPES
import type { typesMatchStatus } from './typesMatch';

export type typesAddMatchForm = {
    location: string;
    location_url: string;
    price: string;
    team1_name: string;
    team2_name: string;
    starts_at_day: string;
    starts_at_hour: string;
    match_type: string;
    match_gender: string;
    match_duration: number;
    added_by: string;
    match_level: string;
    status: typesMatchStatus;
    has_teams?: boolean;
}