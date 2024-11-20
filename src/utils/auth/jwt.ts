// LIBRARIES
import { SignJWT, jwtVerify } from 'jose';

// We dont use randomBytes because in our Middleware we refresh our JWT, and middleware doesn't support randomBytes or any Node.js specific libraries!!!
//import { randomBytes } from 'crypto';

// CONFIG
import { DEFAULT_JWT_EXPIRATION_TIME } from '@/config';

// TYPES
import type { typesTokenPayload } from '@/types/auth/typesAuth';

export async function generateToken(userId: string): Promise<string> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    // Explained why commented up in imports
    // const jti = randomBytes(16).toString('hex');

    // crypto.getRandomValues in this case will not throw error in middleware! Explained above
    const jti = Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => 
        byte.toString(16).padStart(2, '0')
    ).join('');
    
    return new SignJWT({ 
        sub: userId, 
        jti
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + DEFAULT_JWT_EXPIRATION_TIME)
        .setNotBefore(Math.floor(Date.now() / 1000))
        .sign(secretKey);
}

export async function verifyToken(token: string): Promise<typesTokenPayload> {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256']
    });

    return payload as typesTokenPayload;
}