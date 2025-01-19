export interface LoginUser {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    is_verified: boolean;
}

export type typesVerificationEmail = {
    verificationUrl: string;
};

export interface typesResetPasswordEmail {
    resetUrl: string;
}

export interface typesTokenPayload {
    sub: string; // standard JWT claim for subject (user ID)
    iat: number; // issued at
    exp: number; // expiration time
    isAdmin: boolean;
    has_access: boolean;
}

export type typesNewUser = {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
}