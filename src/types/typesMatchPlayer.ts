export type typesMatchPlayer = {
    id: string;
    matchId: string;
    userId: string;
    substitute_requested: boolean;
    team_number: 1 | 2;
    created_at: Date;
}