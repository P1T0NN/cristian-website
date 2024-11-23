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

    const searchParams = req.nextUrl.searchParams;
    const matchId = searchParams.get('matchId');

    if (!matchId) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FETCH_INVALID_REQUEST') }, { status: 400 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    const { data, error } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .eq('match_id', matchId)
        .eq('user_id', payload.sub)
        .single();

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), 
        data: { isMatchAdmin: data?.has_match_admin || false }
    });
}