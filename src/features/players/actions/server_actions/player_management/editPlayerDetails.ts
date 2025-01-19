"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesPlayer } from '@/features/players/types/typesPlayer';

interface EditPlayerDetailsResponse {
    success: boolean;
    message: string;
    data?: typesPlayer;
}

interface EditPlayerDetailsParams {
    playerIdFromParams: string;
    fullName: string;
    dni: string;
    country: string;
    phoneNumber: string;
    playerLevel: string;
    playerPosition: string;
}

export async function editPlayerDetails({
    playerIdFromParams,
    fullName,
    dni,
    country,
    phoneNumber,
    playerLevel,
    playerPosition
}: EditPlayerDetailsParams): Promise<EditPlayerDetailsResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!playerIdFromParams || !fullName || !dni || !country || !phoneNumber || !playerLevel || !playerPosition) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ 
            fullName,
            dni,
            player_level: playerLevel,
            player_position: playerPosition,
            country,
            phoneNumber
        })
        .eq('id', playerIdFromParams)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('INTERNAL_SERVER_ERROR') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);

    return { success: true, message: t('PLAYER_DETAILS_UPDATED'), data: data as typesPlayer };
}