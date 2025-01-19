"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface FinishMatchResponse {
    success: boolean;
    message: string;
}

interface FinishMatchParams {
    matchIdFromParams: string;
}

export async function finishMatch({
    matchIdFromParams
}: FinishMatchParams): Promise<FinishMatchResponse> {
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

    const { data, error } = await supabase.rpc('finish_match', {
        p_match_id: matchIdFromParams
    });

    if (error) {
        return { success: false, message: t('MATCH_FINISH_FAILED') };
    }

    if (!data.success) {
        return { success: false, message: t("MATCH_FINISHED_SUCCESSFULLY") };
    }

    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`);

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("MATCH_FINISHED_SUCCESSFULLY") };
}

/*

CREATE OR REPLACE FUNCTION finish_match(p_match_id UUID) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_new_debt NUMERIC;
    v_price_numeric NUMERIC;
    v_current_debt NUMERIC;
    v_formatted_time TEXT;
BEGIN
    -- Log start and match ID
    RAISE NOTICE 'Starting finish_match for match ID: %', p_match_id;

    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RAISE NOTICE 'Match not found with ID: %', p_match_id;
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_ID_INVALID');
    END IF;
    
    v_price_numeric := v_match.price::NUMERIC;
    v_formatted_time := TO_CHAR(v_match.starts_at_hour::time, 'HH24:MI');
    
    -- Handle debts for regular players who haven't paid
    FOR v_player IN 
        SELECT * FROM match_players 
        WHERE match_id = p_match_id 
        AND player_type = 'regular' 
        AND NOT has_paid 
        AND NOT has_gratis 
        AND NOT has_entered_with_balance
    LOOP
        BEGIN
            SELECT COALESCE(player_debt, 0) INTO v_current_debt
            FROM users
            WHERE id = v_player.user_id;

            UPDATE users
            SET player_debt = v_current_debt + v_price_numeric
            WHERE id = v_player.user_id
            RETURNING player_debt INTO v_new_debt;
            
            INSERT INTO debts (player_name, player_debt, cristian_debt, reason, added_by)
            SELECT 
                "fullName",
                v_price_numeric,
                0,
                'Cuota no pagada para el partido del ' || v_match.starts_at_day || 
                ' a las ' || v_formatted_time || ' en ' || v_match.location,
                'System'
            FROM users
            WHERE id = v_player.user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error handling debt for player: %', SQLERRM;
            RETURN jsonb_build_object('success', false, 'code', 'DEBT_UPDATE_FAILED', 'details', SQLERRM);
        END;
    END LOOP;
    
    -- Update match status to finished
    BEGIN
        UPDATE matches 
        SET status = 'finished'
        WHERE id = p_match_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error updating match status: %', SQLERRM;
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_UPDATE_FAILED', 'details', SQLERRM);
    END;
    
    RETURN jsonb_build_object('success', true, 'code', 'MATCH_FINISHED_SUCCESSFULLY');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error in finish_match: %', SQLERRM;
        RETURN jsonb_build_object('success', false, 'code', 'UNEXPECTED_ERROR', 'details', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/