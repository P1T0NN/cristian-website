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

// UTILS
import { checkMatchAdminPermissions } from '../../utils/matchUtils';

interface FinishMatchResponse {
    success: boolean;
    message: string;
}

interface FinishMatchParams {
    matchIdFromParams: string;
}

export const finishMatch = async ({
    matchIdFromParams
}: FinishMatchParams): Promise<FinishMatchResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const { isAuth, userId } = await verifyAuth();
        
    if (!isAuth || !userId) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if user has admin permissions
    const permissionCheck = await checkMatchAdminPermissions(userId, matchIdFromParams);
    
    if (!permissionCheck.hasPermission) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Get match details
    const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchIdFromParams)
        .single();
    
    if (matchError) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // Handle debts for regular players who haven't paid
    const { data: unpaidPlayers, error: playersError } = await supabase
        .from("match_players")
        .select("*, user:userId(name)")
        .eq("matchId", matchIdFromParams)
        .eq("playerType", "regular")
        .eq("hasPaid", false)
        .eq("hasGratis", false)
        .eq("hasEnteredWithBalance", false);
    
    if (playersError) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }
    
    // Process each unpaid player
    for (const player of unpaidPlayers) {
        // Get current debt
        const { data: userData, error: userError } = await supabase
            .from("user")
            .select("playerDebt")
            .eq("id", player.userId)
            .single();
        
        if (userError) {
            return { success: false, message: t('INTERNAL_SERVER_ERROR') };
        }
        
        const currentDebt = userData.playerDebt || 0;
        const newDebt = currentDebt + matchData.price;
        
        // Update user's debt
        const { error: updateError } = await supabase
            .from("user")
            .update({ playerDebt: newDebt })
            .eq("id", player.userId);
        
        if (updateError) {
            return { success: false, message: t('DEBT_UPDATE_FAILED') };
        }
        
        // Insert debt record
        const { error: debtError } = await supabase
            .from("debts")
            .insert({
                player_name: player.user.name,
                player_debt: matchData.price,
                cristian_debt: 0,
                reason: `Match fee not paid for match on ${matchData.startsAtDay} at ${matchData.startsAtHour} in ${matchData.location}`,
                added_by: 'System'
            });
        
        if (debtError) {
            return { success: false, message: t('DEBT_RECORD_FAILED') };
        }
    }
    
    // Update match status to finished
    const { error: updateError } = await supabase
        .from("matches")
        .update({ status: 'finished' })
        .eq("id", matchIdFromParams);
    
    if (updateError) {
        return { success: false, message: t('MATCH_STATUS_UPDATE_FAILED') };
    }

    revalidatePath("/");
    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.ACTIVE_MATCHES_COUNT);

    return { success: true, message: t("MATCH_FINISHED_SUCCESSFULLY") };
};