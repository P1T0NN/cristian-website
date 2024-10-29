// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPERS
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(req: NextRequest): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) return NextResponse.json({ success: false, message: genericMessages('UNAUTHORIZED') }, { status: 401 });

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) return NextResponse.json({ success: false, message: genericMessages('JWT_DECODE_ERROR') }, { status: 401 });

    const { matchId, userId, teamNumber, action } = await req.json();

    if (!matchId || !userId || !teamNumber || !action) return NextResponse.json({ success: false, message: genericMessages('MATCH_FETCH_INVALID_REQUEST') }, { status: 400 });

    if (action === 'join') {
        const { error } = await supabase.from('match_players').insert({
            match_id: matchId,
            user_id: userId,
            team_number: teamNumber
        });
        if (error) return NextResponse.json({ success: false, message: genericMessages('OPERATION_FAILED') }, { status: 500 });
    } else if (action === 'leave') {
        const { error } = await supabase.from('match_players').delete().match({ match_id: matchId, user_id: userId });
        if (error) return NextResponse.json({ success: false, message: genericMessages('OPERATION_FAILED') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: genericMessages(action === 'join' ? 'PLAYER_JOINED_SUCCESSFULLY' : 'PLAYER_LEFT_SUCCESSFULLY') });
}