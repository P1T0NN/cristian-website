export interface typesDatabaseUser {
    id: string;
    email: string;
    password: string; // hashed
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface typesDatabaseUserVerification {
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    expires_at: string;
}

export type typesDatabaseResetPasswordToken = {
    id: string;
    user_id: string;
    token: string;
    created_at: string;
    expires_at: string;
};