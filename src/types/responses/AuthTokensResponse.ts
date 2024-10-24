export type AuthTokensResponse = {
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    csrfToken?: string;
}