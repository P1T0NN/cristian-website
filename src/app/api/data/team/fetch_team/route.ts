// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';
import { jwtVerify } from 'jose';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function GET(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });
    }

    const url = new URL(req.url);
    const teamId = url.searchParams.get('teamId');

    if (!teamId) {
        return NextResponse.json({ success: false, message: genericMessages('TEAM_ID_REQUIRED') }, { status: 400 });
    }

    // Fetch team from database
    const { data: team, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

    if (error) {
        return NextResponse.json({ success: false, message: fetchMessages('FAILED_TO_FETCH_TEAM') }, { status: 500 });
    }

    if (!team) {
        return NextResponse.json({ success: false, message: fetchMessages('TEAM_NOT_FOUND') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: fetchMessages('TEAM_FETCHED'), data: team });
}