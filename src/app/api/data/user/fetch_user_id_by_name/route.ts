// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// UTILS
import { decrypt } from '@/utils/encryption';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function GET(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const encryptedPlayerName = searchParams.get('playerName');

    if (!encryptedPlayerName) {
        return NextResponse.json({ success: false, message: genericMessages('PLAYER_NAME_REQUIRED') });
    }

    const playerName = decrypt(encryptedPlayerName);

    // Fetch user ID by name
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('fullName', playerName)
        .single();

    if (userError) {
        return NextResponse.json({ success: false, message: genericMessages('USER_NOT_FOUND') });
    }

    if (!user) {
        return NextResponse.json({ success: false, message: genericMessages('USER_NOT_FOUND') });
    }

    return NextResponse.json({ success: true, message: fetchMessages('USER_ID_FETCHED'), data: { id: user.id } });
}