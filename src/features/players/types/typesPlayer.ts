// TYPES
import type { typesDebt } from '@/features/debt/types/typesDebt';
import type { typesBalance } from '@/features/balance/types/typesBalance';

export type PlayerType = 'regular' | 'temporary';

export interface typesBaseMatchPlayer {
    id: string;
    matchId: string;
    userId: string;           // For regular: actual user_id, For temporary: added_by_id
    player_type: PlayerType;
    team_number: 0 | 1 | 2;
    substitute_requested: boolean;
    temporary_player_name?: string;
    created_at: Date;
    has_paid: boolean;
    has_discount: boolean;
    has_gratis: boolean;
    has_match_admin: boolean;
    has_added_friend: boolean;
    has_entered_with_balance: boolean;
    user?: {                  // Add this for regular players
        id: string;
        fullName: string;
    };
    added_by?: {             // For temporary players
        id: string;
        fullName: string;
    };
}

export interface typesUser {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
    is_verified: boolean;
    isAdmin: boolean;
    player_debt: number;
    cristian_debt: number;
    player_level: string;
    player_position: string;
    created_at: Date;
    dni: string;
    country: string;
    has_access: boolean;
    balance: number;
    verify_documents: boolean;
    debts?: typesDebt[];
    balances?: typesBalance[];
}

export interface typesRegularPlayer {
    type: 'regular';
    id: string;
    user: typesUser;
    matchPlayer: typesBaseMatchPlayer;
    teamNumber: number;
    substituteRequested: boolean;
}

export interface typesTemporaryPlayer {
    type: 'temporary';
    id: string;
    temporary_player_name: string;
    phoneNumber?: string;
    matchPlayer: typesBaseMatchPlayer;
    teamNumber: number;
    substituteRequested: boolean;
}

export type typesPlayer = typesRegularPlayer | typesTemporaryPlayer;