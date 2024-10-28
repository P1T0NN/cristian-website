// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function GET(request: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '7';

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!)).catch(() => ({ payload: null }));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('INVALID_JWT_TOKEN') }, { status: 401 });
    }

    if (!search) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_SEARCH_TERM'), data: [] });
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, fullName, email')
        .ilike('fullName', `%${search}%`)
        .order('fullName')
        .limit(Number(limit));

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('FAILED_TO_SEARCH_USERS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: fetchMessages('USERS_FETCHED'), data });
}