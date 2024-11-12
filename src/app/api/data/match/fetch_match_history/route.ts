// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { subMonths } from 'date-fns';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesMatchHistory } from '@/types/typesMatchHistory';

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

    // Calculate the date 1 month ago
    const oneMonthAgo = subMonths(new Date(), 1).toISOString();

    // Delete matches older than 1 month
    await supabase
        .from('match_history')
        .delete()
        .lt('created_at', oneMonthAgo);

    // Fetch remaining match history from database
    const { data: matchHistory, error: supabaseError } = await supabase
        .from('match_history')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<typesMatchHistory[]>();

    if (supabaseError) {
        return NextResponse.json({ success: false, message: fetchMessages('MATCH_HISTORY_FAILED_TO_FETCH') }, { status: 500 });
    }

    // If no match history found
    if (!matchHistory || matchHistory.length === 0) {
        return NextResponse.json({ success: true, message: fetchMessages('NO_MATCH_HISTORY_FOUND'), data: [] });
    }

    return NextResponse.json({ success: true, message: fetchMessages('MATCH_HISTORY_SUCCESSFULLY_FETCHED'), data: matchHistory });
}