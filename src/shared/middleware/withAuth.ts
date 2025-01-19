// NEXTJS IMPORTS
import { NextRequest, NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// UTILS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

type HandlerFunction = (
    request: NextRequest, 
    userId: string, 
    token: string
) => Promise<NextResponse>;

export function withAuth(handler: HandlerFunction) {
    return async (request: NextRequest) => {
        const t = await getTranslations("GenericMessages");

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: t("UNAUTHORIZED") }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const { userId } = await verifyAuth(token);

        return handler(request, userId as string, token);
    };
}