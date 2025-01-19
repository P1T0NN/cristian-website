"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// In match_players table when we delete match we run this SQL:
//  ALTER TABLE match_players
//  ADD CONSTRAINT fk_match_players_match
//  FOREIGN KEY (match_id) REFERENCES matches(id)
//  ON DELETE CASCADE;
// So now when we delete match all associated rows will be deleted, so do not worry about cleaning up in code manually other tables (rows)

/* Same goes for temporary_players table
ALTER TABLE temporary_players
ADD CONSTRAINT fk_temporary_players_match
FOREIGN KEY (match_id) REFERENCES matches(id)
ON DELETE CASCADE;
*/

interface DeleteMatchResponse {
    success: boolean;
    message: string;
}

interface DeleteMatchParams {
    matchIdFromParams: string;
}

export async function deleteMatch({
    matchIdFromParams
}: DeleteMatchParams): Promise<DeleteMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    const { isAuth } = await verifyAuth(authToken as string);
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Call RPC function to handle all database operations
    const { data, error } = await supabase.rpc('delete_match', {
        p_match_id: matchIdFromParams
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { success: false, message: t('MATCH_DELETION_FAILED') };
    }

    // Delete the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`);

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("MATCH_DELETED") };
}

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION delete_match(
    p_match_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_refunded_count INT := 0;
BEGIN
    -- Get match details first
    SELECT * INTO v_match 
    FROM matches 
    WHERE id = p_match_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Refund all players who entered with balance
    FOR v_player IN (
        SELECT mp.user_id, mp.has_entered_with_balance
        FROM match_players mp
        WHERE mp.match_id = p_match_id
        AND mp.has_entered_with_balance = true
    ) LOOP
        -- Restore balance to user
        UPDATE users 
        SET balance = balance + v_match.price
        WHERE id = v_player.user_id;
        
        v_refunded_count := v_refunded_count + 1;
    END LOOP;

    -- Delete the match (this will cascade to match_players and temporary_players)
    DELETE FROM matches 
    WHERE id = p_match_id;

    RETURN jsonb_build_object(
        'success', true,
        'code', 'MATCH_DELETED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'refunded_players_count', v_refunded_count,
            'match_price', v_match.price
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;

GRANT EXECUTE ON FUNCTION delete_match(UUID) TO authenticated;

*/