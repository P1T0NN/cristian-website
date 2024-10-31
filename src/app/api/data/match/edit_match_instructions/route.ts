// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// SERVICES
import { redisCacheService } from '@/services/server/redis-cache.service';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

const MATCH_CACHE_KEY_PREFIX = 'match:';

interface EditMatchInstructionsRequest {
    matchId: string;
    instructions: string;
}

export async function PUT(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'editMatchInstructions');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_INSTRUCTIONS_EDIT_RATE_LIMITED') }, { status: 429 });
    }
    
    const { matchId, instructions }: EditMatchInstructionsRequest = await req.json();

    if (!matchId) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_ID_INVALID') }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('matches')
        .update({ match_instructions: instructions })
        .eq('id', matchId);

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('MATCH_INSTRUCTIONS_EDIT_FAILED') }, { status: 400 });
    }

    // Invalidate the specific match cache
    await redisCacheService.delete(`${MATCH_CACHE_KEY_PREFIX}${matchId}`);

    return NextResponse.json({ success: true, message: genericMessages("MATCH_INSTRUCTIONS_UPDATED"), data });
}