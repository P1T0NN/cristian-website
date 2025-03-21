"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface CancelSubstituteResponse {
    success: boolean;
    message: string;
    code?: string;
}

interface CancelSubstituteParams {
    matchIdFromParams: string;
    playerType: 'regular' | 'temporary';
}

export const cancelSubstitute = async ({
    matchIdFromParams,
    playerType
}: CancelSubstituteParams): Promise<CancelSubstituteResponse> => {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: currentUserId } = await verifyAuth();
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Find the player record
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
        console.error('Error finding player:', playerError);
        return { 
            success: false, 
            message: t('PLAYER_NOT_FOUND'),
            code: 'PLAYER_NOT_FOUND' 
        };
    }

    // Update the player's substituteRequested status
    const { error: updateError } = await supabase
        .from('match_players')
        .update({ substituteRequested: false })
        .eq('id', playerData.id);

    if (updateError) {
        console.error('Error updating substitute request:', updateError);
        return { 
            success: false, 
            message: t('CANCEL_SUBSTITUTE_FAILED'),
            code: 'UPDATE_FAILED'
        };
    }

    // Revalidate paths
    revalidatePath(`/matches/${matchIdFromParams}`);
    revalidatePath("/");

    return { 
        success: true, 
        message: t(playerType === 'temporary' ? 
            'FRIEND_SUBSTITUTE_CANCELED_SUCCESSFULLY' : 
            'SUBSTITUTE_CANCELED_SUCCESSFULLY'
        ),
        code: playerType === 'temporary' ? 
            'FRIEND_SUBSTITUTE_CANCELED_SUCCESSFULLY' : 
            'SUBSTITUTE_CANCELED_SUCCESSFULLY'
    };
};