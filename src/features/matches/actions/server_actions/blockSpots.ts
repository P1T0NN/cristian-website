"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface BlockSpotsResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface BlockSpotsParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    spotsToBlock: number;
}

export const blockSpots = async ({
    matchIdFromParams,
    teamNumber,
    spotsToBlock
}: BlockSpotsParams): Promise<BlockSpotsResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId } = await verifyAuth();
        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || typeof spotsToBlock !== 'number') {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('block_spots', {
        p_auth_user_id: userId,
        p_match_id: matchIdFromParams,
        p_team_number: teamNumber,
        p_spots_to_block: spotsToBlock
    });

    if (error) {
        console.error('RPC error:', error);
        return { success: false, message: t('SPOTS_BLOCK_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: t('SPOTS_BLOCKED_SUCCESSFULLY'),
        metadata: data?.metadata
    };
};

/* SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION block_spots(
    p_auth_user_id TEXT,
    p_match_id UUID,
    p_team_number INT,
    p_spots_to_block INT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_current_blocked_spots INT;
    v_updated_places_occupied INT;
    v_spots_difference INT;
BEGIN
    -- Check if the user is an admin
    SELECT "isAdmin" INTO v_user FROM "user" WHERE id = p_auth_user_id;
    IF NOT v_user."isAdmin" THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED');
    END IF;

    -- Get the current match data
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Get the current blocked spots
    IF p_team_number = 1 THEN
        v_current_blocked_spots := COALESCE(v_match."blockSpotsTeam1", 0);
    ELSE
        v_current_blocked_spots := COALESCE(v_match."blockSpotsTeam2", 0);
    END IF;

    -- Calculate the difference in blocked spots
    v_spots_difference := p_spots_to_block - v_current_blocked_spots;

    -- Update places_occupied
    v_updated_places_occupied := GREATEST(0, COALESCE(v_match."placesOccupied", 0) + v_spots_difference);

    -- Update the blocked spots and places_occupied
    IF p_team_number = 1 THEN
        UPDATE matches 
        SET "blockSpotsTeam1" = p_spots_to_block, 
            "placesOccupied" = v_updated_places_occupied
        WHERE id = p_match_id;
    ELSE
        UPDATE matches 
        SET "blockSpotsTeam2" = p_spots_to_block, 
            "placesOccupied" = v_updated_places_occupied
        WHERE id = p_match_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'SPOTS_BLOCKED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updated_places_occupied', v_updated_places_occupied,
            'blocked_spots', p_spots_to_block
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

GRANT EXECUTE ON FUNCTION block_spots(TEXT, UUID, INT, INT) TO authenticated;

*/