// NEXTJS IMPORTS
import { headers } from 'next/headers';

// LIBRARIES
import { SignJWT, jwtVerify } from 'jose';

// We dont use randomBytes because in our Middleware we refresh our JWT, and middleware doesn't support randomBytes or any Node.js specific libraries!!!
//import { randomBytes } from 'crypto';

// CONFIG
import { DEFAULT_JWT_EXPIRATION_TIME } from '@/config';

// TYPES
import type { typesTokenPayload } from '@/types/auth/typesAuth';

async function generateFingerprint(userId: string): Promise<string> {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'Unknown';

    const data = `${userId}-${userAgent}-${ipAddress}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function generateToken(userId: string, isAdmin: boolean, hasAccess: boolean): Promise<string> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const fingerprint = await generateFingerprint(userId);
    
    const now = Math.floor(Date.now() / 1000);
    
    return new SignJWT({ 
        sub: userId,
        isAdmin,
        has_access: hasAccess
    })
        .setProtectedHeader({ alg: 'HS256', fingerprint })
        .setIssuedAt(now)
        .setExpirationTime(now + DEFAULT_JWT_EXPIRATION_TIME)
        .sign(secretKey);
}

export async function verifyToken(token: string): Promise<typesTokenPayload> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const { payload, protectedHeader } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256']
    });
  
    if (typeof payload.sub !== 'string' || typeof protectedHeader.fingerprint !== 'string') {
        throw new Error('Invalid token payload or header');
    }
  
    const expectedFingerprint = await generateFingerprint(payload.sub);
  
    if (protectedHeader.fingerprint !== expectedFingerprint) {
        throw new Error('Invalid token fingerprint');
    }
  
    return {
        sub: payload.sub,
        iat: payload.iat as number,
        exp: payload.exp as number,
        isAdmin: payload.isAdmin as boolean,
        has_access: payload.has_access as boolean
    };
}