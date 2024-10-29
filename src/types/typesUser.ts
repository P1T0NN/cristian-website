// TYPES
import type { typesDebt } from "./typesDebt";

export type typesUser = {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    is_verified: boolean;
    isAdmin: boolean;
    player_debt: number;
    cristian_debt: number;
    created_at: Date;
    debts?: typesDebt[];
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