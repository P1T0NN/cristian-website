// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// UTILS
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesJWTPayload } from '@/types/typesJWTPayload';
import type { typesUser } from '@/types/typesUser';

export type VerifyJWTResponse = APIResponse & {
    user?: typesUser;
};

export async function POST(request: NextRequest): Promise<NextResponse<VerifyJWTResponse>> {
    const t = await getTranslations('GenericMessages');

    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ success: false, message: t('NO_JWT_FOUND') }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        decoded = payload as typesJWTPayload;
    } catch {
        return NextResponse.json({ success: false, message: t('INVALID_JWT_TOKEN') }, { status: 401 });
    }

    // Verify token has not expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
        return NextResponse.json({ success: false, message: t('JWT_EXPIRED') }, { status: 401 });
    }

    if (decoded.type !== 'access') {
        return NextResponse.json({ success: false, message: t('INVALID_JWT_TOKEN') }, { status: 401 });
    }

    // Extract userId from the sub field
    const userId: string = decoded.sub;

    return NextResponse.json({ success: true, message: t('JWT_VERIFIED'), userId });
}