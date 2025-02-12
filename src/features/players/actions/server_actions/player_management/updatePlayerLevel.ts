"use server"

// NEXTJS IMPORTS
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

interface UpdatePlayerLevelResponse {
    success: boolean;
    message: string;
    data?: typesPlayer;
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

    const { isAuth } = await verifyAuth();
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId || !newLevel) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('user')
        .update({ playerLevel: newLevel })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('UPDATE_PLAYER_LEVEL_FAILED') };
    }

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);
    return { success: true, message: t('PLAYER_LEVEL_UPDATED_SUCCESSFULLY'), data: data as typesPlayer };
}