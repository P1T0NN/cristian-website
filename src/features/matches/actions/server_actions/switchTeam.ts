"use server"

// NEXTJS IMPORTS
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

export const switchTeam = async ({
    matchIdFromParams,
    playerId,
    playerType
}: SwitchTeamParams): Promise<SwitchTeamResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth();
                    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { error } = await supabase.rpc('switchplayerteam', {
        matchid: matchIdFromParams,
        playerid: playerId,
        playertype: playerType
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

CREATE OR REPLACE FUNCTION switchPlayerTeam(
    matchId UUID,
    playerId TEXT,
    playerType TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_newTeamNumber INT;
BEGIN
    -- Verify match exists
    SELECT * INTO v_match FROM matches WHERE id = matchId;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Switch team number for any player type
    UPDATE match_players 
    SET "teamNumber" = CASE 
        WHEN "teamNumber" = 1 THEN 2 
        WHEN "teamNumber" = 2 THEN 1
        ELSE "teamNumber" 
    END 
    WHERE "matchId" = matchId 
    AND id = playerId
    AND "playerType" = playerType
    AND "teamNumber" IN (1, 2)
    RETURNING "teamNumber" INTO v_newTeamNumber;

    IF v_newTeamNumber IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'PLAYER_NOT_FOUND_OR_NOT_IN_TEAM'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_SWITCHED_TEAM_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'newTeamNumber', v_newTeamNumber
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR',
            'message', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION switchPlayerTeam(UUID, TEXT, TEXT) TO authenticated;

*/