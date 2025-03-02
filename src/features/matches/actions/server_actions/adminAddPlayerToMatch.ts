"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface AdminAddPlayerToMatchResponse {
    success: boolean;
    message: string;
}

interface AdminAddPlayerToMatchParams {
    matchIdFromParams: string;
    teamNumber: 1 | 2;
    playerName: string;
}

export async function adminAddPlayerToMatch({
    matchIdFromParams,
    teamNumber,
    playerName
}: AdminAddPlayerToMatchParams): Promise<AdminAddPlayerToMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !teamNumber || !playerName) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('admin_add_player', {
        p_match_id: matchIdFromParams,
        p_team_number: teamNumber,
        p_player_name: playerName,
        p_admin_user_id: userId
    });

    if (error) {
        return { success: false, message: t("INTERNAL_SERVER_ERROR") };
    }

    revalidatePath(`/matches/${matchIdFromParams}`);

    return data as AdminAddPlayerToMatchResponse;
}

/*

DROP FUNCTION IF EXISTS admin_add_player;

CREATE OR REPLACE FUNCTION admin_add_player(
  p_match_id UUID,
  p_team_number INTEGER,
  p_player_name TEXT,
  p_admin_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match RECORD;
  v_max_players INTEGER;
  v_blocked_spots INTEGER;
  v_temp_player_id UUID;
  v_updated_places INTEGER;
BEGIN
  -- Start transaction explicitly
  BEGIN
    -- Check if admin
    IF NOT EXISTS (SELECT 1 FROM "user" WHERE id = p_admin_user_id AND "isAdmin" = true) THEN
      RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- Get match data
    SELECT * INTO v_match FROM matches WHERE id = p_match_id;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'message', 'Match not found');
    END IF;
    
    -- Calculate max players based on match type
    CASE v_match."matchType"::TEXT
      WHEN 'F7' THEN v_max_players := 14;
      WHEN 'F8' THEN v_max_players := 16;
      WHEN 'F11' THEN v_max_players := 22;
      ELSE v_max_players := 16; -- Default to F8
    END CASE;
    
    -- Get blocked spots for the team
    IF p_team_number = 1 THEN
      v_blocked_spots := COALESCE(v_match."blockSpotsTeam1", 0);
    ELSE
      v_blocked_spots := COALESCE(v_match."blockSpotsTeam2", 0);
    END IF;
    
    -- Check if match is full
    IF COALESCE(v_match."placesOccupied", 0) >= v_max_players - v_blocked_spots THEN
      RETURN jsonb_build_object('success', false, 'message', 'Match is full');
    END IF;
    
    -- Generate a unique ID for the temporary player
    v_temp_player_id := gen_random_uuid();
    
    -- Insert temporary player
    INSERT INTO match_players (
      id, 
      "matchId", 
      "userId", 
      "playerType", 
      "teamNumber", 
      "temporaryPlayerName", 
      "createdAt", 
      "hasPaid", 
      "hasDiscount", 
      "hasGratis", 
      "hasMatchAdmin", 
      "hasAddedFriend", 
      "hasEnteredWithBalance"
    ) VALUES (
      v_temp_player_id,
      p_match_id,
      p_admin_user_id,
      'temporary',
      p_team_number,
      p_player_name,
      NOW(),
      false,
      false,
      false,
      false,
      false,
      false
    );
    
    -- Update places_occupied in the match and get the new value
    UPDATE matches 
    SET "placesOccupied" = COALESCE("placesOccupied", 0) + 1
    WHERE id = p_match_id
    RETURNING "placesOccupied" INTO v_updated_places;
    
    -- Commit the transaction implicitly
    
    -- Return success with updated places info for verification
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Player added successfully',
      'newPlacesOccupied', v_updated_places
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RETURN jsonb_build_object('success', false, 'message', 'Internal server error: ' || SQLERRM);
  END;
END;
$$;

*/