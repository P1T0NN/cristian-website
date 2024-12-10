"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// TYPES
import { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function managePlayer(
    authToken: string,
    matchId: string,
    userId: string,
    teamNumber: 0 | 1 | 2,
    action: 'join' | 'leave' | 'requestSubstitute' | 'replacePlayer' | 'switchTeam',
    isTemporaryPlayer: boolean = false
): Promise<{ success: boolean; message: string; metadata?: Record<string, unknown> }> {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    let payload;
    try {
        const verifyResult = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
        payload = verifyResult.payload;
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    if (!payload || typeof payload.sub !== 'string') {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    if (!matchId || !userId || !action) {
        return { success: false, message: t('MATCH_FETCH_INVALID_REQUEST') };
    }

    const { data, error } = await supabase.rpc('manage_player', {
        p_auth_user_id: payload.sub,
        p_match_id: matchId,
        p_user_id: userId,
        p_team_number: teamNumber,
        p_action: action,
        p_is_temporary_player: isTemporaryPlayer
    });

    if (error) {
        return { success: false, message: t('OPERATION_FAILED'), metadata: { error: error.message, details: error.details } };
    }

    const result = data as RPCResponseData;

    if (!result.success) {
        return { 
            success: false, 
            message: t(result.code, result.metadata),
            metadata: result.metadata
        };
    }

    // Update the cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<{ places_occupied?: number }>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { 
            ...cachedMatch.data, 
            places_occupied: action === 'join' 
                ? (cachedMatch.data.places_occupied || 0) + 1 
                : Math.max((cachedMatch.data.places_occupied || 0) - 1, 0)
        };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
    }

    revalidatePath("/");

    return { 
        success: result.success, 
        message: t(result.code, result.metadata),
        metadata: result.metadata 
    };
}

/*

OUR RPC SUPABASE FUNCTIONS

CREATE OR REPLACE FUNCTION manage_player(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_user_id UUID,
    p_team_number INT,
    p_action TEXT,
    p_is_temporary_player BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_current_time TIMESTAMP;
    v_eight_hours_before_match TIMESTAMP;
    v_updated_places_occupied INT;
    v_table_name TEXT;
    v_id_column TEXT;
    v_has_entered_with_balance BOOLEAN;
    v_updated_balance NUMERIC;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    v_current_time := CURRENT_TIMESTAMP;
    v_eight_hours_before_match := (v_match.starts_at_day || ' ' || v_match.starts_at_hour)::TIMESTAMP - INTERVAL '8 hours';
    v_updated_places_occupied := COALESCE(v_match.places_occupied, 0);

    IF p_is_temporary_player THEN
        v_table_name := 'temporary_players';
        v_id_column := 'id';
    ELSE
        v_table_name := 'match_players';
        v_id_column := 'user_id';
    END IF;

    IF p_action = 'leave' AND v_current_time > v_eight_hours_before_match THEN
        RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
    END IF;

    CASE p_action
        WHEN 'join' THEN
            IF p_is_temporary_player THEN
                INSERT INTO temporary_players (match_id, id, team_number)
                VALUES (p_match_id, p_user_id, p_team_number);
            ELSE
                IF v_user.balance >= v_match.price::numeric THEN
                    INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
                    VALUES (p_match_id, p_user_id, p_team_number, true, true);
                    
                    UPDATE users
                    SET balance = balance - v_match.price::numeric
                    WHERE id = p_user_id
                    RETURNING balance INTO v_updated_balance;
                ELSE
                    INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
                    VALUES (p_match_id, p_user_id, p_team_number, false, false);
                END IF;
            END IF;
            v_updated_places_occupied := v_updated_places_occupied + 1;

        WHEN 'leave' THEN
            IF NOT p_is_temporary_player THEN
                SELECT has_entered_with_balance INTO v_has_entered_with_balance
                FROM match_players
                WHERE match_id = p_match_id AND user_id = p_user_id;

                IF v_has_entered_with_balance THEN
                    UPDATE users
                    SET balance = balance + v_match.price::numeric
                    WHERE id = p_user_id
                    RETURNING balance INTO v_updated_balance;
                END IF;
            END IF;

            EXECUTE format('DELETE FROM %I WHERE match_id = $1 AND %I = $2', v_table_name, v_id_column)
            USING p_match_id, p_user_id;
            v_updated_places_occupied := GREATEST(v_updated_places_occupied - 1, 0);

        WHEN 'switchTeam' THEN
            EXECUTE format('UPDATE %I SET team_number = CASE WHEN team_number = 1 THEN 2 ELSE 1 END WHERE match_id = $1 AND %I = $2', v_table_name, v_id_column)
            USING p_match_id, p_user_id;
            
            IF NOT FOUND THEN
                RETURN jsonb_build_object(
                    'success', false, 
                    'code', 'PLAYER_NOT_FOUND', 
                    'metadata', jsonb_build_object(
                        'isTemporaryPlayer', p_is_temporary_player,
                        'matchId', p_match_id,
                        'userId', p_user_id
                    )
                );
            END IF;

        WHEN 'requestSubstitute' THEN
            IF NOT p_is_temporary_player THEN
                UPDATE match_players
                SET substitute_requested = true
                WHERE match_id = p_match_id AND user_id = p_user_id;
            ELSE
                RETURN jsonb_build_object(
                    'success', false, 
                    'code', 'CANNOT_REQUEST_SUBSTITUTE_FOR_TEMPORARY_PLAYER'
                );
            END IF;

        WHEN 'replacePlayer' THEN
            IF NOT p_is_temporary_player THEN
                SELECT has_entered_with_balance INTO v_has_entered_with_balance
                FROM match_players
                WHERE match_id = p_match_id AND user_id = p_user_id;

                IF v_has_entered_with_balance THEN
                    UPDATE users
                    SET balance = balance + v_match.price::numeric
                    WHERE id = p_user_id;
                END IF;

                DELETE FROM match_players
                WHERE match_id = p_match_id AND user_id = p_user_id;

                -- Check the balance of the user who is replacing
                SELECT balance INTO v_updated_balance FROM users WHERE id = p_auth_user_id;

                IF v_updated_balance >= v_match.price::numeric THEN
                    UPDATE users
                    SET balance = balance - v_match.price::numeric
                    WHERE id = p_auth_user_id
                    RETURNING balance INTO v_updated_balance;

                    INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
                    VALUES (p_match_id, p_auth_user_id, p_team_number, true, true);
                ELSE
                    INSERT INTO match_players (match_id, user_id, team_number, has_paid, has_entered_with_balance)
                    VALUES (p_match_id, p_auth_user_id, p_team_number, false, false);
                END IF;
            ELSE
                RETURN jsonb_build_object(
                    'success', false, 
                    'code', 'CANNOT_REPLACE_TEMPORARY_PLAYER'
                );
            END IF;

        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INVALID_ACTION');
    END CASE;

    UPDATE matches
    SET places_occupied = v_updated_places_occupied
    WHERE id = p_match_id;

    RETURN jsonb_build_object('success', true, 'code', 
        CASE p_action
            WHEN 'join' THEN 'PLAYER_JOINED_SUCCESSFULLY'
            WHEN 'leave' THEN 'PLAYER_LEFT_SUCCESSFULLY'
            WHEN 'requestSubstitute' THEN 'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
            WHEN 'switchTeam' THEN 'PLAYER_SWITCHED_TEAM_SUCCESSFULLY'
            WHEN 'replacePlayer' THEN 'PLAYER_REPLACED_SUCCESSFULLY'
            ELSE 'OPERATION_SUCCESSFUL'
        END,
        'metadata', jsonb_build_object(
            'has_paid', CASE 
                WHEN p_action IN ('join', 'replacePlayer') AND NOT p_is_temporary_player THEN v_updated_balance >= v_match.price::numeric 
                ELSE NULL 
            END,
            'has_entered_with_balance', CASE 
                WHEN p_action IN ('join', 'replacePlayer') AND NOT p_is_temporary_player THEN v_updated_balance >= v_match.price::numeric 
                ELSE NULL 
            END,
            'updated_balance', v_updated_balance
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR', 
            'message', SQLERRM,
            'sqlstate', SQLSTATE,
            'detail', COALESCE(SQLERRM, 'Unknown error'),
            'context', 'manage_player function',
            'metadata', jsonb_build_object(
                'auth_user_id', p_auth_user_id,
                'match_id', p_match_id,
                'user_id', p_user_id,
                'team_number', p_team_number,
                'action', p_action,
                'is_temporary_player', p_is_temporary_player
            )
        );
END;
$$;

GRANT EXECUTE ON FUNCTION manage_player(UUID, UUID, UUID, INT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE matches, match_players, temporary_players TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


*/