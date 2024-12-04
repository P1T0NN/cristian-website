export type typesMatchHistory = {
    id: string;
    price: number;
    team1_name: string;
    team2_name: string;
    starts_at_day: string;
    starts_at_hour: string;
    match_type: string;
    match_gender: string;
    created_at: string;
    location: string;
    added_by: string;
    location_url: string;
    team1_color: string;
    team2_color: string;
    match_instructions: string;
    finished_at: string;
    players: {
        has_paid: boolean;
        has_discount: boolean;
        has_gratis: boolean;
        has_entered_with_balance: boolean;
        user: {
            fullName: string;
        };
    }[];
    playerStats: {
        playersPaid: number;
        playersWithDiscount: { fullName: string }[];
        playersWithGratis: { fullName: string }[];
        playersEnteredWithBalance: { fullName: string }[];
    };
}