"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// SERVICES
import { upstashRedisCacheService } from '@/shared/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface AddFriendResponse {
    success: boolean;
    message: string;
    metadata?: Record<string, unknown>;
}

interface AddFriendParams {
    matchIdFromParams: string;
    teamNumber: 0 | 1 | 2;
    friendName: string;
    phoneNumber: string;
}

export async function addFriend({
    matchIdFromParams,
    teamNumber,
    friendName,
    phoneNumber
}: AddFriendParams): Promise<AddFriendResponse> {
    const t = await getTranslations("GenericMessages");
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId } = await verifyAuth(authToken as string);

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || teamNumber === undefined || !friendName || !phoneNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('add_temporary_player', {
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
        return { success: false, message: t('FRIEND_ADDITION_FAILED') };
    }

    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchIdFromParams}`;
    const cachedMatch = await upstashRedisCacheService.get<{ places_occupied?: number }>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { 
            ...cachedMatch.data, 
            places_occupied: (cachedMatch.data.places_occupied || 0) + 1
        };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12);
    }

    revalidatePath("/");

    return { success: data.success, message: t("FRIEND_ADDED_SUCCESSFULLY") };
}

/*

OUR SUPABASE RPC FUNCTION

CREATE OR REPLACE FUNCTION add_temporary_player(
    p_user_id UUID,
    p_match_id UUID,
    p_team_number INT,
    p_friend_name TEXT,
    p_phone_number TEXT
) RETURNS JSONB AS $$
DECLARE
    v_match RECORD;
    v_user RECORD;
    v_updated_places_occupied INT;
    v_temp_player RECORD;
BEGIN
    -- Fetch match details
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'MATCH_NOT_FOUND');
    END IF;

    -- Fetch user details
    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'code', 'USER_NOT_FOUND');
    END IF;

    v_updated_places_occupied := COALESCE(v_match.places_occupied, 0) + 1;

    -- Insert temporary player into match_players
    BEGIN
        INSERT INTO match_players (
            match_id,
            user_id,           -- This will be the ID of the user adding the friend
            team_number,
            player_type,
            temporary_player_name,  -- New column for friend's name
            substitute_requested,
            has_paid,
            has_discount,
            has_gratis,
            has_match_admin,
            has_added_friend,
            has_entered_with_balance
        )
        VALUES (
            p_match_id,
            p_user_id,         -- Using the adding user's ID
            p_team_number,
            'temporary',
            p_friend_name,
            false,            -- Default values for other required fields
            false,
            false,
            false,
            false,
            false,
            false
        )
        RETURNING * INTO v_temp_player;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'INSERT_FAILED', 'details', SQLERRM);
    END;

    -- Update places_occupied in matches table
    BEGIN
        UPDATE matches
        SET places_occupied = v_updated_places_occupied
        WHERE id = p_match_id;
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UPDATE_FAILED', 'details', SQLERRM);
    END;

    -- Update has_added_friend for the user who added the friend
    BEGIN
        UPDATE match_players
        SET has_added_friend = true
        WHERE match_id = p_match_id AND user_id = p_user_id AND player_type = 'regular';
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UPDATE_FAILED', 'details', SQLERRM);
    END;

    -- Return success message
    RETURN jsonb_build_object('success', true, 'code', 'FRIEND_ADDED_SUCCESSFULLY', 'data', row_to_json(v_temp_player));

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'code', 'UNEXPECTED_ERROR', 'details', SQLERRM);
END;
$$ LANGUAGE plpgsql;

*/