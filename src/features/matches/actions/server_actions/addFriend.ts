"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface AddFriendResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        temporaryPlayerName: string;
        teamNumber: number;
        playerType: 'temporary';
        playerPosition: string; // This contains "Added by: [name]"
        hasPaid: boolean;
        hasGratis: boolean;
        hasDiscount: boolean;
        hasArrived: boolean;
        addedBy: string; // Name of the user who added the friend
    };
}

interface AddFriendParams {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    friendName: string;
    phoneNumber: string;
}

export const addFriend = async ({
    matchIdFromParams,
    teamNumber,
    friendName,
    phoneNumber
}: AddFriendParams): Promise<AddFriendResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || !friendName || !phoneNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('addtemporaryplayer', {
        p_user_id: userId,
        p_match_id: matchIdFromParams,
        p_team_number: teamNumber,
        p_friend_name: friendName,
        p_phone_number: phoneNumber
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        if (data.code === 'ALREADY_ADDED_FRIEND') {
            return { success: false, message: t('ALREADY_ADDED_FRIEND') };
        }
        return { success: false, message: t('FRIEND_ADDITION_FAILED') };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);

    return { 
        success: true, 
        message: t('FRIEND_ADDED_SUCCESSFULLY'),
        data: {
            id: data.data.id,
            temporaryPlayerName: data.data.temporaryPlayerName,
            teamNumber: data.data.teamNumber,
            playerType: data.data.playerType,
            playerPosition: data.data.playerPosition, // This will be "Added by: [name]"
            hasPaid: data.data.hasPaid,
            hasGratis: data.data.hasGratis,
            hasDiscount: data.data.hasDiscount,
            hasArrived: data.data.hasArrived,
            addedBy: data.data.addedBy // The name of who added the friend
        }
    };
};

/*

OUR SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION addtemporaryplayer(
    p_user_id TEXT,
    p_match_id UUID,
    p_team_number INT,
    p_friend_name TEXT,
    p_phone_number TEXT
) RETURNS JSONB AS $$
DECLARE
    vMatch RECORD;
    vUser RECORD;
    vUpdatedPlacesOccupied INT;
    vTempPlayer RECORD;
    vHasAlreadyAddedFriend BOOLEAN;
    vAddedByName TEXT;
BEGIN
    -- Check if user has already added a friend
    SELECT "hasAddedFriend" INTO vHasAlreadyAddedFriend
    FROM "match_players"
    WHERE "matchId" = p_match_id 
    AND "userId" = p_user_id 
    AND "playerType" = 'regular';

    IF vHasAlreadyAddedFriend THEN
        RETURN jsonb_build_object('success', false, 'code', 'ALREADY_ADDED_FRIEND');
    END IF;

    -- Fetch match details
    SELECT * INTO vMatch FROM "matches" WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Fetch user details and name of who's adding the friend
    SELECT * INTO vUser FROM "user" WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    -- Get the name of the user who's adding the friend
    SELECT name INTO vAddedByName
    FROM "user"
    WHERE id = p_user_id;

    vUpdatedPlacesOccupied := COALESCE(vMatch."placesOccupied", 0) + 1;

    -- Insert temporary player
    INSERT INTO "match_players" (
        "id",
        "matchId",
        "userId",
        "teamNumber",
        "playerType",
        "temporaryPlayerName",
        "substituteRequested",
        "hasPaid",
        "hasDiscount",
        "hasGratis",
        "hasMatchAdmin",
        "hasAddedFriend",
        "hasEnteredWithBalance",
        "hasArrived"
    )
    VALUES (
        gen_random_uuid()::TEXT,
        p_match_id,
        p_user_id,
        p_team_number,
        'temporary',
        p_friend_name,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    )
    RETURNING * INTO vTempPlayer;

    -- Update places occupied
    UPDATE "matches"
    SET "placesOccupied" = vUpdatedPlacesOccupied
    WHERE id = p_match_id;

    -- Update hasAddedFriend status for the regular player
    UPDATE "match_players"
    SET "hasAddedFriend" = true
    WHERE "matchId" = p_match_id 
    AND "userId" = p_user_id 
    AND "playerType" = 'regular';

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'FRIEND_ADDED_SUCCESSFULLY',
        'data', jsonb_build_object(
            'id', vTempPlayer.id,
            'temporaryPlayerName', vTempPlayer."temporaryPlayerName",
            'teamNumber', vTempPlayer."teamNumber",
            'playerType', vTempPlayer."playerType",
            'playerPosition', 'Added by: ' || vAddedByName,
            'hasPaid', vTempPlayer."hasPaid",
            'hasGratis', vTempPlayer."hasGratis",
            'hasDiscount', vTempPlayer."hasDiscount",
            'hasArrived', vTempPlayer."hasArrived",
            'addedBy', vAddedByName
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false, 
            'code', 'UNEXPECTED_ERROR', 
            'details', SQLERRM
        );
END;
$$ LANGUAGE plpgsql

*/