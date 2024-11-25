export type typesAddMatchForm = {
    location: string;
    location_url: string;
    price: number;
    team1_name: string;
    team2_name: string;
    starts_at_day: string;
    starts_at_hour: string;
    match_type: string;
    match_gender: string;
    match_duration: number;
    added_by: string;
    match_level: string;
    has_teams?: boolean;
}