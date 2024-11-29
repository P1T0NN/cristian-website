export type typesMatchPlayer = {
    id: string;
    matchId: string;
    userId: string;
    substitute_requested: boolean;
    team_number: 0 | 1 | 2;
    created_at: Date;
    has_paid: boolean;
    has_discount: boolean;
    has_gratis: boolean;
    has_match_admin: boolean;
    has_added_friend: boolean;
    has_entered_with_balance: boolean;
}