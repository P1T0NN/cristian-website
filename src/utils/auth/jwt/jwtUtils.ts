// LIBRARIES
import { SignJWT } from 'jose';

// TYPES
import type { typesJWTPayload } from '@/types/typesJWTPayload';

export async function generateJWT(userId: string): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 30 * 60; // 30 minutes in seconds

    const payload: typesJWTPayload = {
        type: 'access',
        sub: userId,
        iat,
        exp,
    };

    // Generate JWT
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(iat)
        .setExpirationTime(exp)
        .sign(new TextEncoder().encode(process.env.JWT_SECRET as string));

    return jwt;
}