"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
// We need this type because of how supabase.rpc returns messages
import { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function finishMatch(authToken: string, matchId: string) {
    const t = await getTranslations("GenericMessages");

    if (!authToken || !matchId) {
        return { success: false, message: t(authToken ? 'MATCH_ID_INVALID' : 'UNAUTHORIZED') };
    }

    try {
        await jwtVerify(
            authToken, 
            new TextEncoder().encode(process.env.JWT_SECRET)
        );
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const { data, error } = await supabase.rpc('finish_match', {
        p_match_id: matchId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('MATCH_FINISH_FAILED') };
    }

    if (!result.success) {
        return { 
            success: false, 
            message: t(result.code)
        };
    }

    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);
    revalidatePath("/");

    return { success: true, message: t(result.code) };
}

/*

CREATE OR REPLACE FUNCTION finish_match(p_match_id UUID) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_player RECORD;
    v_new_debt NUMERIC;
    v_price_numeric NUMERIC;
    v_current_debt NUMERIC;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_ID_INVALID');
    END IF;
    
    INSERT INTO match_history (
        id, price, team1_name, team2_name, starts_at_day, starts_at_hour,
        match_type, match_gender, created_at, location, added_by,
        location_url, team1_color, team2_color, match_instructions, finished_at
    ) VALUES (
        v_match.id, v_match.price, v_match.team1_name, v_match.team2_name,
        v_match.starts_at_day, v_match.starts_at_hour, v_match.match_type,
        v_match.match_gender, v_match.created_at, v_match.location, v_match.added_by,
        v_match.location_url, v_match.team1_color, v_match.team2_color,
        v_match.match_instructions, NOW()
    );
    
    v_price_numeric := v_match.price::NUMERIC;
    
    FOR v_player IN SELECT * FROM match_players WHERE match_id = p_match_id
    LOOP
        IF v_player.has_entered_with_balance THEN
            UPDATE users
            SET balance = balance - v_price_numeric
            WHERE id = v_player.user_id;
        ELSIF NOT v_player.has_paid AND NOT v_player.has_gratis THEN
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
                'Cuota no pagada para el partido del ' || v_match.starts_at_day,
                'System'
            FROM users
            WHERE id = v_player.user_id;
        END IF;
    END LOOP;
    
    DELETE FROM temporary_players WHERE match_id = p_match_id;
    DELETE FROM matches WHERE id = p_match_id;
    
    RETURN jsonb_build_object('success', true, 'code', 'MATCH_FINISHED_SUCCESSFULLY');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNKNOWN_ERROR');
END;
$$ LANGUAGE plpgsql;

*/