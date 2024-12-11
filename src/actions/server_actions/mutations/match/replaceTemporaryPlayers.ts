"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

export async function replaceTemporaryPlayer(authToken: string, matchId: string, temporaryPlayerId: string, teamNumber: number) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    let authUserId: string;
    try {
        const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));
        if (!payload || typeof payload.sub !== 'string') {
            return { success: false, message: t('JWT_DECODE_ERROR') };
        }
        authUserId = payload.sub;
    } catch {
        return { success: false, message: t('JWT_DECODE_ERROR') };
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