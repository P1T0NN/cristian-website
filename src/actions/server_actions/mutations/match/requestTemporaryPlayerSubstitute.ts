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

export async function requestTemporaryPlayerSubstitute(authToken: string, matchId: string, temporaryPlayerId: string) {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: authUserId } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId || !temporaryPlayerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('request_temporary_player_substitute', {
        p_auth_user_id: authUserId,
        p_match_id: matchId,
        p_temporary_player_id: temporaryPlayerId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') };
    }

    if (!result.success) {
        return { success: false, message: t('TEMPORARY_PLAYER_SUBSTITUTE_REQUEST_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t('TEMPORARY_PLAYER_SUBSTITUTE_REQUESTED') };
}