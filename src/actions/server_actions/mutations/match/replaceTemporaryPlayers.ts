"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function replaceTemporaryPlayer(authToken: string, matchId: string, temporaryPlayerId: string, teamNumber: number) {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId) {
        return { success: false, message: t('MATCH_ID_INVALID') };
    }

    const { data, error } = await supabase.rpc('replace_temporary_player', {
        p_auth_user_id: authUserId,
        p_match_id: matchId,
        p_temporary_player_id: temporaryPlayerId,
        p_team_number: teamNumber
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t('PLAYER_REPLACED_SUCCESSFULLY') };
}