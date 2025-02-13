"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface CancelSubstituteResponse {
    success: boolean;
    message: string;
}

interface CancelSubstituteParams {
    matchIdFromParams: string;
    currentUserId: string;
    playerType: 'regular' | 'temporary';
}

export const cancelSubstitute = async ({
    matchIdFromParams,
    currentUserId,
    playerType
}: CancelSubstituteParams): Promise<CancelSubstituteResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth();
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !currentUserId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('cancel_substitute', {
        pauthuserid: authUserId,
        pmatchid: matchIdFromParams,
        pcurrentuserid: currentUserId,
        pistemporary: playerType === 'temporary'
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        return { 
            success: false, 
            message: t('CANCEL_SUBSTITUTE_FAILED')
        };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t(playerType === 'temporary' ? 
            'FRIEND_SUBSTITUTE_CANCELED_SUCCESSFULLY' : 
            'SUBSTITUTE_CANCELED_SUCCESSFULLY'
        )
    };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION cancel_substitute(
    pauthuserid TEXT,
    pmatchid UUID,
    pcurrentuserid TEXT,
    pistemporary BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    vPlayer RECORD;
BEGIN
    -- Get player record based on playerType
    SELECT * INTO vPlayer 
    FROM match_players 
    WHERE "matchId" = pmatchid
    AND "userId" = pcurrentuserid
    AND "playerType" = CASE 
        WHEN pistemporary THEN 'temporary'
        ELSE 'regular'
    END;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
    END IF;

    -- For temporary players, the userId is the ID of the user who added them
    -- For regular players, verify it's their own record
    IF (pistemporary AND vPlayer."userId" != pauthuserid) OR
       (NOT pistemporary AND vPlayer."userId" != pauthuserid) THEN
        RETURN jsonb_build_object('success', false, 'code', 'NOT_AUTHORIZED');
    END IF;

    -- Update the substitute request status
    UPDATE match_players
    SET "substituteRequested" = false
    WHERE id = vPlayer.id;

    RETURN jsonb_build_object(
        'success', true,
        'code', CASE 
            WHEN pistemporary THEN 'FRIEND_SUBSTITUTE_CANCELED_SUCCESSFULLY'
            ELSE 'SUBSTITUTE_CANCELED_SUCCESSFULLY'
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

GRANT EXECUTE ON FUNCTION cancel_substitute(TEXT, UUID, TEXT, BOOLEAN) TO authenticated;

*/