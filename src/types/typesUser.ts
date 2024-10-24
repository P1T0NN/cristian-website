export type typesUser = {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    is_verified: boolean;
    isAdmin: boolean;
    created_at: Date;
}

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