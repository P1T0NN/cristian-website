"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function editPlayerDetails(authToken: string, playerId: string, dni: string, country: string, phoneNumber: string, playerLevel: string, playerPosition: string) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!playerId || !dni || !country || !phoneNumber || !playerLevel || !playerPosition) {
        return { success: false, message: genericMessages('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ 
            dni: dni, 
            player_level: playerLevel, 
            player_position: playerPosition ,
            country: country,
            phoneNumber: phoneNumber
        })
        .eq('id', playerId)

    if (error) {
        return { success: false, message: genericMessages('UNKNOWN_ERROR') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages('PLAYER_DETAILS_UPDATED'), data };
}