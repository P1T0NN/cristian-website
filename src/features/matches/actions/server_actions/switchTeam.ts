"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface SwitchTeamResponse {
    success: boolean;
    message: string;
}

interface SwitchTeamParams {
    matchIdFromParams: string;
    playerId: string;
    playerType: 'regular' | 'temporary';
}

export async function switchTeam({
    matchIdFromParams,
    playerId,
    playerType
}: SwitchTeamParams): Promise<SwitchTeamResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { error } = await supabase.rpc('switch_team', {
        p_match_id: matchIdFromParams,
        p_player_id: playerId,
        p_player_type: playerType
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t('PLAYER_SWITCHED_TEAM_SUCCESSFULLY') 
    };
}

/* SUPABASE RPC FUNCTION 

CREATE OR REPLACE FUNCTION switch_team(
    p_match_id UUID,
    p_player_id UUID,
    p_player_type TEXT
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
    -- Verify match exists
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Set table and column names based on player type
    IF p_player_type = 'temporary' THEN
        v_table_name := 'temporary_players';
        v_id_column := 'id';
    ELSE
        v_table_name := 'match_players';
        v_id_column := 'id';
    END IF;

    -- Switch team number (1 -> 2 or 2 -> 1)
    EXECUTE format('
        UPDATE %I 
        SET team_number = CASE 
            WHEN team_number = 1 THEN 2 
            WHEN team_number = 2 THEN 1
            ELSE team_number 
        END 
        WHERE match_id = $1 AND %I = $2
        AND team_number IN (1, 2)
        RETURNING team_number', 
        v_table_name, v_id_column
    )
    INTO v_new_team_number
    USING p_match_id, p_player_id;

    IF v_new_team_number IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'PLAYER_NOT_FOUND_OR_NOT_IN_TEAM',
            'metadata', jsonb_build_object(
                'playerType', p_player_type,
                'matchId', p_match_id,
                'playerId', p_player_id
            )
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_SWITCHED_TEAM_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'matchId', p_match_id,
            'playerId', p_player_id,
            'newTeamNumber', v_new_team_number,
            'playerType', p_player_type
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

GRANT EXECUTE ON FUNCTION switch_team(UUID, UUID, TEXT) TO authenticated;

*/