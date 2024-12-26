"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { RPCResponseData } from '@/types/responses/RPCResponseData';

interface ReplacePlayerResponse {
    success: boolean;
    message: string;
}

interface ReplacePlayerParams {
    matchIdFromParams: string;
    userId: string;
    teamNumber: number;
}

export async function replacePlayer({
    matchIdFromParams,
    userId,
    teamNumber
}: ReplacePlayerParams): Promise<ReplacePlayerResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !userId || !teamNumber) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('replace_player', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_user_id: userId,
        p_team_number: teamNumber
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('PLAYER_REPLACE_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t('PLAYER_REPLACED_SUCCESSFULLY') };
}