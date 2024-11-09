"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

export async function editPlayerDetails(authToken: string, playerId: string, dni: string, playerLevel: string, playerPosition: string) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET)).catch(() => ({ payload: null }));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ 
            dni: dni, 
            player_level: playerLevel, 
            player_position: playerPosition 
        })
        .eq('id', playerId)

    if (error) {
        return { success: false, message: 'Failed to update player details' };
    }

    revalidatePath("/");

    return { success: true, message: 'Player details updated successfully', data };
}