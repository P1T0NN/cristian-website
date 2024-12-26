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

interface RequestTemporaryPlayerSubstituteResponse {
    success: boolean;
    message: string;
}

interface RequestTemporaryPlayerSubstituteParams {
    matchIdFromParams: string;
    temporaryPlayerId: string;
}

export async function requestTemporaryPlayerSubstitute({
    matchIdFromParams,
    temporaryPlayerId
}: RequestTemporaryPlayerSubstituteParams): Promise<RequestTemporaryPlayerSubstituteResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: authUserId } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams || !temporaryPlayerId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase.rpc('request_temporary_player_substitute', {
        p_auth_user_id: authUserId,
        p_match_id: matchIdFromParams,
        p_temporary_player_id: temporaryPlayerId
    });

    const result = data as RPCResponseData;

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    if (!result.success) {
        return { success: false, message: t('TEMPORARY_PLAYER_SUBSTITUTE_REQUEST_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t('TEMPORARY_PLAYER_SUBSTITUTE_REQUESTED') };
}