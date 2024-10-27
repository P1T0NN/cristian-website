// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';

interface EditMatchRequest extends typesAddMatchForm {
    matchId: string;
}

export async function PUT(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'editMatch');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_EDIT_RATE_LIMITED') }, { status: 429 });
    }
    
    const { matchId, ...matchData }: EditMatchRequest = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_ID_INVALID') }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            location: matchData.location,
            price: matchData.price,
            team1_name: matchData.team1_name,
            team2_name: matchData.team2_name,
            starts_at_day: matchData.starts_at_day,
            starts_at_hour: matchData.starts_at_hour,
            match_type: matchData.match_type,
            match_gender: matchData.match_gender,
            added_by: matchData.added_by
        })
        .eq('id', matchId);

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_EDIT_FAILED') }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: genericMessages("MATCH_UPDATED"), data });
}