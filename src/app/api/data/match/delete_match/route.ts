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

// In match_players table when we delete match we run this SQL:
//  ALTER TABLE match_players
//  ADD CONSTRAINT fk_match_players_match
//  FOREIGN KEY (match_id) REFERENCES matches(id)
//  ON DELETE CASCADE;
// So now when we delete match all associated rows will be deleted, so do not worry about cleaning up in code manually other tables (rows)

const MATCH_CACHE_KEY_PREFIX = 'match_';
const ALL_MATCHES_CACHE_KEY = 'all_matches';

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

    // Delete the specific match cache
    await redisCacheService.delete(`${MATCH_CACHE_KEY_PREFIX}${matchId}`);

    // Invalidate the all_matches cache
    await redisCacheService.delete(ALL_MATCHES_CACHE_KEY);

    return NextResponse.json({ success: true, message: genericMessages("MATCH_DELETED") }, { status: 200 });
}