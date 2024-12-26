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
import type { typesUser } from '@/types/typesUser';

interface EditPlayerDetailsResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface EditPlayerDetailsParams {
    playerIdFromParams: string;
    dni: string;
    country: string;
    phoneNumber: string;
    playerLevel: string;
    playerPosition: string;
}

export async function editPlayerDetails({
    playerIdFromParams,
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

    if (!playerIdFromParams || !dni || !country || !phoneNumber || !playerLevel || !playerPosition) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ 
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

    revalidatePath("/");

    return { success: true, message: t('PLAYER_DETAILS_UPDATED'), data: data as typesUser };
}