export type typesMatchPlayer = {
    id: string;
    matchId: string;
    userId: string;
    substitute_requested: boolean;
    team_number: 1 | 2;
    created_at: Date;
    has_paid: boolean;
    has_discount: boolean;
    has_gratis: boolean;
    has_match_admin: boolean;
}