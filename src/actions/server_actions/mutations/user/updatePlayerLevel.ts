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

interface UpdatePlayerLevelResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface UpdatePlayerLevelParams {
    userId: string;
    newLevel: string;
}

export async function updatePlayerLevel({ 
    userId, 
    newLevel 
}: UpdatePlayerLevelParams): Promise<UpdatePlayerLevelResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId || !newLevel) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ player_level: newLevel })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('UPDATE_PLAYER_LEVEL_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('PLAYER_LEVEL_UPDATED_SUCCESSFULLY'), data: data as typesUser };
}