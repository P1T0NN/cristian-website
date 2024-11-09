"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// CONFIG
import { CACHE_KEYS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// In match_players table when we delete match we run this SQL:
//  ALTER TABLE match_players
//  ADD CONSTRAINT fk_match_players_match
//  FOREIGN KEY (match_id) REFERENCES matches(id)
//  ON DELETE CASCADE;
// So now when we delete match all associated rows will be deleted, so do not worry about cleaning up in code manually other tables (rows)

export async function deleteMatch(authToken: string, matchId: string) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('MATCH_ID_INVALID') };
    }

    const { error } = await supabase
        .from('matches')
        .delete()
        .match({ id: matchId });

    if (error) {
        return { success: false, message: genericMessages('MATCH_DELETION_FAILED') };
    }

    // Delete the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_DELETED") };
}