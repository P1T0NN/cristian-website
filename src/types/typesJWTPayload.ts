export type typesJWTPayload = {
    type: 'access';
    sub: string;
    iat: number;
    exp: number;
}