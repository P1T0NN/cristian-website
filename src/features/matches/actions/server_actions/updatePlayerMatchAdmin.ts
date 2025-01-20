"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesBaseMatchPlayer } from '@/features/players/types/typesPlayer';

interface UpdatePlayerMatchAdminParams {
    matchIdFromParams: string;
    matchPlayerId: string;
    isCurrentUserAdmin: boolean;
}

interface UpdatePlayerMatchAdminResponse {
    success: boolean;
    message: string;
}

interface MatchPlayerWithUser extends Omit<typesBaseMatchPlayer, 'user'> {
    users: {
        id: string;
        fullName: string;
    };
}

export async function updatePlayerMatchAdmin({
    matchIdFromParams,
    matchPlayerId,
    isCurrentUserAdmin
}: UpdatePlayerMatchAdminParams): Promise<UpdatePlayerMatchAdminResponse> {
    const t = await getTranslations("GenericMessages");

    const { data: playerData } = await supabase
        .from('match_players')
        .select(`
            has_match_admin,
            users (
                id,
                fullName
            )
        `)
        .eq('id', matchPlayerId)
        .single() as { data: MatchPlayerWithUser | null };

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    const { isAuth } = await verifyAuth(authToken as string);

    if (!isAuth || !isCurrentUserAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Use the database value instead of UI value
    const actualCurrentValue = playerData?.has_match_admin ?? false;
    const userFullName = playerData?.users?.fullName;

    // Start a Supabase transaction
    const { error } = await supabase.rpc('update_match_admin', {
        p_match_id: matchIdFromParams,
        p_match_player_id: matchPlayerId,
        p_has_match_admin: !actualCurrentValue,
        p_user_full_name: userFullName
    });

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    revalidatePath(`${PROTECTED_PAGE_ENDPOINTS.MATCH_PAGE}/${matchIdFromParams}`);

    return { 
        success: true, 
        message: t('MATCH_ADMIN_STATUS_UPDATED')
    };
}

/* SUPABASE RPC

create or replace function update_match_admin(
  p_match_id uuid,
  p_match_player_id uuid,
  p_has_match_admin boolean,
  p_user_full_name text
) returns void as $$
begin
  -- Update match_players table
  update match_players
  set has_match_admin = p_has_match_admin
  where id = p_match_player_id;

  -- Update matches table if granting admin (not removing)
  if p_has_match_admin then
    update matches
    set added_by = p_user_full_name
    where id = p_match_id;
  end if;
end;
$$ language plpgsql;

*/