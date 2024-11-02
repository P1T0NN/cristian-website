export type typesMatch = {
    id: string;
    added_by: string;
    location: string;
    location_url: string;
    price: number;
    team1_name: string;
    team2_name: string;
    starts_at_day: string;
    starts_at_hour: string;
    match_type: string;
    match_gender: string;
    // I made it bool because it's less expensive action then string
    team1_color: boolean;
    team2_color: boolean;
    match_instructions: string;
    created_at: Date;
};