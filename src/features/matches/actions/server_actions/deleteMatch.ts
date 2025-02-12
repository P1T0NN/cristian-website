"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

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

export const deleteMatch = async ({
    matchIdFromParams
}: DeleteMatchParams): Promise<DeleteMatchResponse> => {
    console.log('Starting deleteMatch with params:', { matchIdFromParams });
    
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId: authUserId } = await verifyAuth();
    console.log('Auth check result:', { isAuth, authUserId });
        
    if (!isAuth) {
        console.log('Auth failed');
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        console.log('Missing matchIdFromParams');
        return { success: false, message: t('BAD_REQUEST') };
    }

    console.log('Calling delete_match RPC with params:', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    const { data, error } = await supabase.rpc('delete_match', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    if (error) {
        console.error('RPC error:', error);
        return { success: false, message: t('MATCH_DELETION_FAILED') };
    }

    console.log('RPC response:', data);

    if (!data.success) {
        console.log('Deletion failed with code:', data.code);
        return { success: false, message: t('MATCH_DELETION_FAILED') };
    }

    console.log('Match deleted successfully, revalidating paths');
    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("MATCH_DELETED_SUCCESSFULLY") };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION delete_match(
    p_auth_user_id TEXT,
    p_match_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_player RECORD;
    v_refunded_count INT := 0;
BEGIN
    RAISE LOG 'Starting delete_match with params: auth_user=%, match=%',
        p_auth_user_id, p_match_id;

    -- Verify admin permissions (either global admin or match admin)
    SELECT "isAdmin" INTO v_user FROM "user" WHERE id = p_auth_user_id;
    
    IF NOT EXISTS (
        SELECT 1 FROM match_players 
        WHERE "matchId" = p_match_id 
        AND "userId" = p_auth_user_id 
        AND "hasMatchAdmin" = true
    ) AND NOT v_user."isAdmin" THEN
        RAISE LOG 'User not authorized: %', p_auth_user_id;
        RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED');
    END IF;

    -- Get match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RAISE LOG 'Match not found: %', p_match_id;
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Refund all players who entered with balance
    FOR v_player IN (
        SELECT mp."userId"
        FROM match_players mp
        WHERE mp."matchId" = p_match_id
        AND mp."hasEnteredWithBalance" = true
    ) LOOP
        -- Restore balance to user
        UPDATE "user"
        SET balance = balance + v_match.price::numeric
        WHERE id = v_player."userId";
        
        v_refunded_count := v_refunded_count + 1;
        
        RAISE LOG 'Refunded balance for player: %', v_player."userId";
    END LOOP;

    -- Delete the match (this will cascade to match_players)
    DELETE FROM matches 
    WHERE id = p_match_id;

    RAISE LOG 'Successfully deleted match: %, refunded % players', 
        p_match_id, v_refunded_count;
    
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
        RAISE LOG 'Unexpected error in delete_match: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION delete_match(TEXT, UUID) TO authenticated;

*/