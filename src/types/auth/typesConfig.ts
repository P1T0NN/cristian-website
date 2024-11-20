// TYPES
import type { typesVerificationEmail, typesResetPasswordEmail } from "./typesAuth";
import type { RateLimitConfig } from "./typesRateLimit";

export interface typesAuthConfig {
    supabaseUrl: string;
    supabaseKey: string;
    jwtSecret: string;
    encryptionKey: string;
    tokenExpiration: number; // in seconds, default 24h
    resendApiKey: string;
    sendVerificationEmail: boolean;
    frontendUrl: string;
    emailFrom: string;
    verificationEmailSubject: string;
    generateVerificationEmailContent: (props: typesVerificationEmail) => string | Promise<string>;
    resetPasswordEmailSubject: string;
    generateResetPasswordEmailContent: (props: typesResetPasswordEmail) => string | Promise<string>;
    rateLimit: {
        enabled: boolean;
        config: RateLimitConfig & {
            url: string;
            token: string; // Required for Upstash
        };
    };
    resetPasswordRateLimit: {
        points: number;
        duration: number;
    };
    resendVerificationEmailRateLimit: {
        points: number;
        duration: number;
    };
    customFields?: string[];
    cookieOptions?: {
        maxAge?: number;
        domain?: string;
        path?: string;
        expires?: Date;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    };
}