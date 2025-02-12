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

interface FinishMatchResponse {
    success: boolean;
    message: string;
}

interface FinishMatchParams {
    matchIdFromParams: string;
}

export const finishMatch = async ({
    matchIdFromParams
}: FinishMatchParams): Promise<FinishMatchResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId: authUserId } = await verifyAuth();
        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('finish_match', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams
    });

    if (error) {
        return { success: false, message: t('MATCH_FINISH_FAILED') };
    }

    if (!data.success) {
        console.log('Finish failed with code:', data.code);
        return { success: false, message: t('MATCH_FINISH_FAILED') };
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("MATCH_FINISHED_SUCCESSFULLY") };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION finish_match(
    p_auth_user_id TEXT,
    p_match_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_user RECORD;
    v_new_debt NUMERIC;
    v_current_debt NUMERIC;
BEGIN
    RAISE LOG 'Starting finish_match with params: auth_user=%, match=%',
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

    -- Handle debts for regular players who haven't paid
    FOR v_player IN 
        SELECT mp.*, u.name as player_name 
        FROM match_players mp
        JOIN "user" u ON u.id = mp."userId"
        WHERE mp."matchId" = p_match_id 
        AND mp."playerType" = 'regular' 
        AND NOT mp."hasPaid"
        AND NOT mp."hasGratis"
        AND NOT mp."hasEnteredWithBalance"
    LOOP
        BEGIN
            -- Get current debt
            SELECT "playerDebt" INTO v_current_debt
            FROM "user"
            WHERE id = v_player."userId";

            -- Update user's debt
            UPDATE "user"
            SET "playerDebt" = COALESCE(v_current_debt, 0) + v_match.price::numeric
            WHERE id = v_player."userId"
            RETURNING "playerDebt" INTO v_new_debt;
            
            -- Insert debt record with snake_case column names
            INSERT INTO debts (
                player_name,
                player_debt,
                cristian_debt,
                reason,
                added_by
            )
            VALUES (
                v_player.player_name,
                v_match.price::numeric,
                0,
                'Match fee not paid for match on ' || v_match."startsAtDay" || 
                ' at ' || v_match."startsAtHour" || ' in ' || v_match.location,
                'System'
            );

            RAISE LOG 'Updated debt for player: %, new debt: %', 
                v_player."userId", v_new_debt;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Error handling debt for player %: %', 
                v_player."userId", SQLERRM;
            RETURN jsonb_build_object(
                'success', false, 
                'code', 'DEBT_UPDATE_FAILED',
                'message', SQLERRM
            );
        END;
    END LOOP;
    
    -- Update match status to finished
    UPDATE matches 
    SET status = 'finished'
    WHERE id = p_match_id;

    RAISE LOG 'Successfully finished match: %', p_match_id;
    
    RETURN jsonb_build_object('success', true, 'code', 'MATCH_FINISHED_SUCCESSFULLY');
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Unexpected error in finish_match: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION finish_match(TEXT, UUID) TO authenticated;

*/