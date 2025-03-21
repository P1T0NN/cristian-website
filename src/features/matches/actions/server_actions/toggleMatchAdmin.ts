"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface ToggleMatchAdminResponse {
    success: boolean;
    message: string;
}

interface ToggleMatchAdminParams {
    matchPlayerId: string;
    matchIdFromParams: string;
    isMatchAdmin: boolean;
}

export const toggleMatchAdmin = async ({
    matchPlayerId,
    matchIdFromParams,
    isMatchAdmin
}: ToggleMatchAdminParams): Promise<ToggleMatchAdminResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth();
                
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Verify admin permissions
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("isAdmin")
        .eq("id", userId)
        .single();
    
    if (userError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    if (!userData.isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }
    
    // Get match details
    const { error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }
    
    // Get player details
    const { data: playerData, error: playerError } = await supabase
        .from("match_players")
        .select("*, user:userId(name)")
        .eq("id", matchPlayerId)
        .eq("matchId", matchIdFromParams)
        .single();
    
    if (playerError) {
        return { success: false, message: t('PLAYER_NOT_IN_MATCH') };
    }
    
    // Update match_players hasMatchAdmin status
    const { error: updatePlayerError } = await supabase
        .from("match_players")
        .update({ hasMatchAdmin: isMatchAdmin })
        .eq("id", matchPlayerId);
    
    if (updatePlayerError) {
        return { success: false, message: t('TOGGLE_MATCH_ADMIN_FAILED') };
    }
    
    // If setting as match admin, update matches table addedBy
    if (isMatchAdmin) {
        const { error: updateMatchError } = await supabase
            .from("matches")
            .update({ addedBy: playerData.user.name })
            .eq("id", matchIdFromParams);
        
        if (updateMatchError) {
            return { success: false, message: t('TOGGLE_MATCH_ADMIN_FAILED') };
        }
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: isMatchAdmin ? t('MATCH_ADMIN_ADDED') : t('MATCH_ADMIN_REMOVED')
    };
};