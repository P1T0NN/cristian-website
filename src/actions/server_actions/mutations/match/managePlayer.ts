"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

export async function managePlayer(
    authToken: string,
    matchId: string,
    userId: string,
    teamNumber: 1 | 2,
    action: 'join' | 'leave'
) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    if (!matchId || !userId || !teamNumber || !action) {
        return { success: false, message: genericMessages('MATCH_FETCH_INVALID_REQUEST') };
    }
    
    if (action === 'join') {
        const { error } = await supabase
            .from('match_players')
            .insert({
                match_id: matchId,
                user_id: userId,
                team_number: teamNumber
            });

        if (error) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    } else if (action === 'leave') {
        const { error } = await supabase
            .from('match_players')
            .delete()
            .match({ 
                match_id: matchId, 
                user_id: userId 
            });
        
        if (error) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    }

    revalidatePath("/");

    return { success: true, message: genericMessages(action === 'join' ? 'PLAYER_JOINED_SUCCESSFULLY' : 'PLAYER_LEFT_SUCCESSFULLY') };
}