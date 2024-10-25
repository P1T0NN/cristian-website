// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatch } from '@/types/typesMatch';

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

    // Fetch matches data directly from database
    const { data: matches, error: supabaseError } = await supabase
        .from('matches')
        .select(`
            id,
            added_by,
            location,
            price,
            team1_name,
            team1_players,
            team2_name,
            team2_players,
            starts_at_day,
            starts_at_hour,
            match_type,
            created_at
        `)
        .order('created_at', { ascending: false })
        .returns<typesMatch[]>();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCHES_FAILED_TO_FETCH') }, { status: 500 });
    }

    if (!matches || matches.length === 0) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_MATCHES_FOUND'), data: [] });
    }

    return NextResponse.json({ success: true, message: fetchMessages('MATCHES_SUCCESSFULLY_FETCHED'), data: matches });
}