"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function switchTeam(authToken: string, matchId: string, userId: string, isTemporaryPlayer: boolean = false) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    let authUserId: string;
    try {
        const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
        if (!payload || typeof payload.sub !== 'string') {
            return { success: false, message: t('JWT_DECODE_ERROR') };
        }
        authUserId = payload.sub;
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const { data, error } = await supabase.rpc('switch_team', {
        p_auth_user_id: authUserId,
        p_match_id: matchId,
        p_user_id: userId,
        p_is_temporary_player: isTemporaryPlayer
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { 
            success: false, 
            message: t(result.code, result.metadata),
            metadata: result.metadata
        };
    }

    revalidatePath("/");

    return { 
        success: result.success, 
        message: t(result.code, result.metadata),
        metadata: result.metadata
    };
}

/* SUPABASE RPC FUNCTION 

CREATE OR REPLACE FUNCTION switch_team(
    p_auth_user_id UUID,
    p_match_id UUID,
    p_user_id UUID,
    p_is_temporary_player BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_table_name TEXT;
    v_id_column TEXT;
    v_new_team_number INT;
BEGIN
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    IF p_is_temporary_player THEN
        v_table_name := 'temporary_players';
        v_id_column := 'id';
    ELSE
        v_table_name := 'match_players';
        v_id_column := 'user_id';
    END IF;

    EXECUTE format('
        UPDATE %I 
        SET team_number = CASE WHEN team_number = 1 THEN 2 ELSE 1 END 
        WHERE match_id = $1 AND %I = $2
        RETURNING team_number', v_table_name, v_id_column)
    INTO v_new_team_number
    USING p_match_id, p_user_id;

    IF v_new_team_number IS NULL THEN
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

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_SWITCHED_TEAM_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'matchId', p_match_id,
            'userId', p_user_id,
            'newTeamNumber', v_new_team_number,
            'isTemporaryPlayer', p_is_temporary_player
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
            'context', 'switch_team function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION switch_team(UUID, UUID, UUID, BOOLEAN) TO anon, authenticated;

*/