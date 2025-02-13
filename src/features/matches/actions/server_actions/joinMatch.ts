"use server"

// NEXTJS IMPORTS
import { revalidateTag, revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS, TAGS_FOR_CACHE_REVALIDATIONS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface JoinMatchResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        userId: string;
        name: string;
        hasMatchAdmin: boolean;
        hasPaid: boolean;
        hasDiscount: boolean;
        hasGratis: boolean;
        hasEnteredWithBalance: boolean;
        playerType: 'regular' | 'temporary';
        playerPosition: string;
    }
}

interface JoinMatchParams {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    withBalance: boolean;
}

export async function joinMatch({
    matchIdFromParams,
    teamNumber,
    withBalance
}: JoinMatchParams): Promise<JoinMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
            
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('join_team', {
        pauthuserid: userId,
        pmatchid: matchIdFromParams,
        puserid: userId,
        pteamnumber: teamNumber,
        pwithbalance: withBalance
    });

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!data.success) {
        if (data.code === 'INSUFFICIENT_BALANCE') {
            return { success: false, message: t("INSUFFICIENT_BALANCE_TRY_CASH") };
        }
        return { success: false, message: t("PLAYER_JOIN_FAILED") };
    }

    revalidatePath("/");
    revalidatePath(`${PROTECTED_PAGE_ENDPOINTS.HOME_PAGE}`);
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { 
        success: true, 
        message: t("PLAYER_JOINED_SUCCESSFULLY"),
        data: {
            id: data.metadata.playerId,
            userId: userId as string,
            name: data.metadata.playerName,
            hasMatchAdmin: false,
            hasPaid: data.metadata.hasPaid,
            hasDiscount: false,
            hasGratis: false,
            hasEnteredWithBalance: data.metadata.hasEnteredWithBalance,
            playerType: 'regular',
            playerPosition: data.metadata.playerPosition
        }
    };
}

/* SUPABASE RPC FUNCTION

DROP FUNCTION IF EXISTS join_team(text, uuid, text, integer, boolean);

CREATE OR REPLACE FUNCTION join_team(
    pauthuserid TEXT,
    pmatchid UUID,
    puserid TEXT,
    pteamnumber INT,
    pwithbalance BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    vMatch RECORD;
    vUser RECORD;
    vUpdatedPlacesOccupied INT;
    vUpdatedBalance NUMERIC;
    vHasEnteredWithBalance BOOLEAN;
    vPlayerId TEXT;
    vPlayerName TEXT;
    vPlayerPosition TEXT;
BEGIN
    SELECT * INTO vMatch FROM matches WHERE id = pmatchid;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    SELECT * INTO vUser FROM "user" WHERE id = puserid;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    -- Check if player is already in match
    IF EXISTS (
        SELECT 1 FROM match_players 
        WHERE "matchId" = pmatchid 
        AND "userId" = puserid
    ) THEN
        RETURN jsonb_build_object('success', false, 'code', 'PLAYER_ALREADY_IN_MATCH');
    END IF;

    vUpdatedPlacesOccupied := COALESCE(vMatch."placesOccupied", 0) + 1;
    vPlayerName := vUser.name;
    vPlayerId := gen_random_uuid()::text;
    vPlayerPosition := vUser.position;

    IF pwithbalance THEN
        IF vUser.balance >= vMatch.price::numeric THEN
            UPDATE "user"
            SET balance = balance - vMatch.price::numeric
            WHERE id = puserid
            RETURNING balance INTO vUpdatedBalance;

            vHasEnteredWithBalance := true;
        ELSE
            RETURN jsonb_build_object('success', false, 'code', 'INSUFFICIENT_BALANCE');
        END IF;
    ELSE
        vHasEnteredWithBalance := false;
        vUpdatedBalance := vUser.balance;
    END IF;

    INSERT INTO match_players (
        id,
        "matchId", 
        "userId", 
        "teamNumber", 
        "hasPaid", 
        "hasEnteredWithBalance",
        "playerType",
        "playerPosition"
    )
    VALUES (
        vPlayerId,
        pmatchid, 
        puserid, 
        pteamnumber, 
        false, 
        vHasEnteredWithBalance,
        'regular',
        vPlayerPosition
    );

    UPDATE matches
    SET "placesOccupied" = vUpdatedPlacesOccupied
    WHERE id = pmatchid;

    RETURN jsonb_build_object(
        'success', true, 
        'code', 'PLAYER_JOINED_SUCCESSFULLY',
        'metadata', jsonb_build_object(
            'playerId', vPlayerId,
            'playerName', vPlayerName,
            'hasPaid', false,
            'hasEnteredWithBalance', vHasEnteredWithBalance,
            'updatedBalance', vUpdatedBalance,
            'placesOccupied', vUpdatedPlacesOccupied,
            'playerPosition', vPlayerPosition
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
            'context', 'join_team function'
        );
END;
$$;

GRANT EXECUTE ON FUNCTION join_team(TEXT, UUID, TEXT, INT, BOOLEAN) TO anon, authenticated;

*/