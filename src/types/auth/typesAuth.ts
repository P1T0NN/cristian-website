export type typesLoginCredentials = {
    email: string;
    password: string;
};
  
export type typesRegisterCredentials = {
    email: string;
    password: string;
    [key: string]: string; // This allows for additional custom fields
};
  
export interface typesUser {
    id: string;
    email: string;
    createdAt: Date;
    [key: string]: string | Date | undefined;
}
  
export interface typesAuthResponse {
    user: typesUser;
    token: string;
}

export interface InternalRegisterResponse extends typesAuthResponse {
    verificationToken: string;
}

export interface typesTokenPayload {
    sub: string; // standard JWT claim for subject (user ID)
    iat: number; // issued at
    exp: number; // expiration time
    isAdmin: boolean;
    has_access: boolean;
}

export type typesVerificationEmail = {
    verificationUrl: string;
};

export interface typesResetPasswordEmail {
    resetUrl: string;
}

export type typesRequestPasswordReset = {
    email: string;
};

export type typesResetPassword = {
    token: string;
    newPassword: string;
};