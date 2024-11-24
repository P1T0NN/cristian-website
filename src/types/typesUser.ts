// TYPES
import type { typesDebt } from "./typesDebt";
import type { typesMatchPlayer } from "./typesMatchPlayer";

export type typesUser = {
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
    debts?: typesDebt[];
    matchPlayer?: typesMatchPlayer;
};

// FOR LOGGING IN
export type typesLoginUser = {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    is_verified: boolean;
}

// FOR REGISTERED NEW USER

export type typesNewUser = {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
}