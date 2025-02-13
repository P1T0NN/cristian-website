"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface RequestSubstituteResponse {
    success: boolean;
    message: string;
}

interface RequestSubstituteParams {
    matchIdFromParams: string;
    userId: string;  // This is the user.id from the user table
    playerType: 'regular' | 'temporary';
}

export const requestSubstitute = async ({
    matchIdFromParams,
    userId,  // This is the user.id we want to request substitute for
    playerType
}: RequestSubstituteParams): Promise<RequestSubstituteResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth();
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('request_substitute', {
        pauthuserid: authUserId,
        pmatchid: matchIdFromParams,
        puserid: userId,
        pistemporary: playerType === 'temporary'
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { 
            success: false, 
            message: t('SUBSTITUTE_REQUEST_FAILED')
        };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t(playerType === 'temporary' ? 
            'FRIEND_SUBSTITUTE_REQUESTED_SUCCESSFULLY' : 
            'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
        )
    };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION request_substitute(
    pAuthUserId TEXT,      -- The ID of the authenticated user making the request
    pMatchId UUID,         -- The match ID
    pUserId TEXT,          -- The user.id of the player to request substitute for
    pIsTemporary BOOLEAN   -- Whether this is for a temporary player
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    vMatch RECORD;
    vPlayer RECORD;
BEGIN
    -- Get match details
    SELECT * INTO vMatch FROM matches WHERE id = pMatchId;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get player record using userId (not match_players.id)
    SELECT * INTO vPlayer 
    FROM match_players 
    WHERE "matchId" = pMatchId
    AND "userId" = pUserId  -- Using userId from user table
    AND "playerType" = CASE 
        WHEN pIsTemporary THEN 'temporary'
        ELSE 'regular'
    END;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    -- For temporary players, verify the auth user is the one who added them
    -- For regular players, verify it's their own record
    IF (pIsTemporary AND vPlayer."userId" != pAuthUserId) OR
       (NOT pIsTemporary AND pUserId != pAuthUserId) THEN
        RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED_TO_REQUEST');
    END IF;

    -- Update using userId (not match_players.id)
    UPDATE match_players
    SET "substituteRequested" = true
    WHERE "matchId" = pMatchId
    AND "userId" = pUserId
    AND "playerType" = CASE 
        WHEN pIsTemporary THEN 'temporary'
        ELSE 'regular'
    END;

    RETURN jsonb_build_object(
        'success', true,
        'code', CASE 
            WHEN pIsTemporary THEN 'FRIEND_SUBSTITUTE_REQUESTED_SUCCESSFULLY'
            ELSE 'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
        END
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

GRANT EXECUTE ON FUNCTION request_substitute(TEXT, UUID, TEXT, BOOLEAN) TO authenticated;

*/