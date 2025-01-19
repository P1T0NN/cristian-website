export interface RateLimitConfig {
    points: number;
    duration: number;
    blockDuration: number;
}

export interface UpstashConfig extends RateLimitConfig {
    url: string;
    token: string;
}

export interface RateLimiter {
    limit: (key: string) => Promise<RateLimitResult>;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}