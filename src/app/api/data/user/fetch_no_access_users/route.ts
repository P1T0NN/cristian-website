// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';


export async function GET(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const [genericMessages, fetchMessages] = await Promise.all([
        getTranslations("GenericMessages"),
        getTranslations("FetchMessages")
    ]);

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    } catch {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, fullName, gender, phoneNumber')
        .eq('has_access', false);

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('USERS_FAILED_TO_FETCH') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: fetchMessages('USERS_WITH_NO_ACCESS_FETCHED'), data: users });
}