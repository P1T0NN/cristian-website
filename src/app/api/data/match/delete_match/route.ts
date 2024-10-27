// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function DELETE(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'deleteMatch');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_DELETION_RATE_LIMITED') }, { status: 429 });
    }

    const { matchId } = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_ID_INVALID') }, { status: 400 });
    }

    const { error } = await supabase
        .from('matches')
        .delete()
        .match({ id: matchId });

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_DELETION_FAILED') }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: genericMessages("MATCH_DELETED") }, { status: 200 });
}