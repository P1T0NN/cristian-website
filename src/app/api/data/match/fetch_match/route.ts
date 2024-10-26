// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
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

    // Get matchId from request body
    const { matchId } = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FETCH_INVALID_REQUEST') }, { status: 400 });
    }

    // Fetch single match data from database
    const { data: match, error: supabaseError } = await supabase
        .from('matches')
        .select(`
            id,
            added_by,
            location,
            price,
            team1_name,
            team2_name,
            starts_at_day,
            starts_at_hour,
            match_type,
            match_gender,
            created_at
        `)
        .eq('id', matchId)
        .single();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!match) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_NOT_FOUND') }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_SUCCESSFULLY_FETCHED'), data: match });
}