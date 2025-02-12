"use server"

// NEXTJS IMPORTS
import { revalidatePath, revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface LeaveMatchMetadata {
    code?: string;
    metadata?: {
        canRequestSubstitute?: boolean;
        updatedBalance?: number;
        updatedPlacesOccupied?: number;
    };
}

interface LeaveMatchResponse {
    success: boolean;
    message: string;
    metadata?: LeaveMatchMetadata;
}

interface LeaveMatchParams {
    matchIdFromParams: string;
    currentUserId: string;
    isRemovingFriend?: boolean;
}

export const leaveMatch = async ({
    matchIdFromParams,
    currentUserId,
    isRemovingFriend = false
}: LeaveMatchParams): Promise<LeaveMatchResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth();

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !currentUserId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('leave_match', {
        pauthuserid: authUserId,
        pmatchid: matchIdFromParams,
        pcurrentuserid: currentUserId,
        pisremovingfriend: isRemovingFriend
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        if (data.code === 'TOO_LATE_TO_LEAVE') {
            return { 
                success: false, 
                message: t('TOO_LATE_TO_LEAVE'),
                metadata: data as LeaveMatchMetadata 
            };
        }
        return { 
            success: false, 
            message: t('PLAYER_LEAVE_FAILED'), 
            metadata: data as LeaveMatchMetadata 
        };
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("PLAYER_LEFT_SUCCESSFULLY"), metadata: data };
}

/* SUPABASE RPC FUNCTION 

CREATE OR REPLACE FUNCTION leave_match(
    pauthuserid TEXT,
    pmatchid UUID,
    pcurrentuserid TEXT,
    pisremovingfriend BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    vMatch RECORD;
    vPlayer RECORD;
    vCurrentTime TIMESTAMP;
    vEightHoursBeforeMatch TIMESTAMP;
    vUpdatedPlacesOccupied INT;
    vMatchPrice DECIMAL;
BEGIN
    SELECT * INTO vMatch 
    FROM matches 
    WHERE id = pmatchid;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    vCurrentTime := CURRENT_TIMESTAMP;
    vEightHoursBeforeMatch := (vMatch."startsAtDay" || ' ' || vMatch."startsAtHour")::TIMESTAMP - INTERVAL '8 hours';

    -- Three cases:
    -- 1. Removing friend (pisremovingfriend = true)
    -- 2. Player leaving themselves (pauthuserid = pcurrentuserid)
    -- 3. Admin removing player (pauthuserid != pcurrentuserid)
    
    IF pisremovingfriend THEN
        -- Case 1: Removing friend
        SELECT * INTO vPlayer 
        FROM match_players 
        WHERE "matchId" = pmatchid
        AND "userId" = pauthuserid
        AND "playerType" = 'temporary';

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
        END IF;

        -- Check time limit for friend removal
        IF vCurrentTime > vEightHoursBeforeMatch THEN
            RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
        END IF;

        -- Update hasAddedFriend to false for the regular player
        UPDATE match_players
        SET "hasAddedFriend" = false
        WHERE "matchId" = pmatchid
        AND "userId" = pauthuserid
        AND "playerType" = 'regular';
    ELSIF pauthuserid = pcurrentuserid THEN
        -- Case 2: Player leaving themselves
        SELECT * INTO vPlayer 
        FROM match_players 
        WHERE "matchId" = pmatchid
        AND "userId" = pcurrentuserid;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
        END IF;

        -- Check time limit for regular players leaving themselves
        IF vCurrentTime > vEightHoursBeforeMatch THEN
            RETURN jsonb_build_object('success', false, 'code', 'TOO_LATE_TO_LEAVE', 'metadata', jsonb_build_object('canRequestSubstitute', true));
        END IF;
    ELSE
        -- Case 3: Admin removing player
        SELECT * INTO vPlayer 
        FROM match_players 
        WHERE "matchId" = pmatchid
        AND id = pcurrentuserid;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'code', 'PLAYER_NOT_IN_MATCH');
        END IF;
    END IF;

    IF vPlayer."hasEnteredWithBalance" THEN
        vMatchPrice := vMatch.price;
        
        UPDATE "user"
        SET balance = balance + vMatchPrice
        WHERE id = vPlayer."userId";
    END IF;

    DELETE FROM match_players
    WHERE id = vPlayer.id;

    UPDATE matches
    SET "placesOccupied" = "placesOccupied" - 1
    WHERE id = pmatchid
    RETURNING "placesOccupied" INTO vUpdatedPlacesOccupied;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_LEFT_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'updatedPlacesOccupied', vUpdatedPlacesOccupied,
            'balanceRestored', CASE 
                WHEN vPlayer."hasEnteredWithBalance" THEN vMatchPrice
                ELSE 0
            END
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

*/