"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

interface RequestSubstituteResponse {
    success: boolean;
    message: string;
    code?: string;
}

interface RequestSubstituteParams {
    matchIdFromParams: string;
    playerType: 'regular' | 'temporary';
}

export const requestSubstitute = async ({
    matchIdFromParams,
    playerType
}: RequestSubstituteParams): Promise<RequestSubstituteResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: currentUserId } = await verifyAuth();
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // 1. Get match details
    const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchIdFromParams)
        .single();
    
    if (matchError || !matchData) {
        return { success: false, message: t('MATCH_NOT_FOUND') };
    }

    // 2. Find the player record
    let playerQuery = supabase
        .from('match_players')
        .select('*')
        .eq('matchId', matchIdFromParams)
        .eq('playerType', playerType);

    if (playerType === 'temporary') {
        // For temporary players, find the player added by the current user
        playerQuery = playerQuery.eq('userId', currentUserId);
    } else {
        // For regular players, find the player that is the current user
        playerQuery = playerQuery.eq('userId', currentUserId);
    }

    const { data: playerData, error: playerError } = await playerQuery.single();

    if (playerError || !playerData) {
        return { success: false, message: t('PLAYER_NOT_IN_MATCH') };
    }

    // 3. Update the player record to request a substitute
    const { error: updateError } = await supabase
        .from('match_players')
        .update({ substituteRequested: true })
        .eq('id', playerData.id);

    if (updateError) {
        return { success: false, message: t('SUBSTITUTE_REQUEST_FAILED') };
    }

    // 4. Revalidate relevant paths
    revalidatePath(`/matches/${matchIdFromParams}`);
    revalidatePath("/");

    // 5. Return success response
    return { 
        success: true, 
        message: t(playerType === 'temporary' ? 
            'FRIEND_SUBSTITUTE_REQUESTED_SUCCESSFULLY' : 
            'SUBSTITUTE_REQUESTED_SUCCESSFULLY'
        )
    };
};