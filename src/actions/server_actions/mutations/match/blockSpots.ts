"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function blockSpots(
    authToken: string,
    matchId: string,
    teamNumber: 1 | 2,
    spotsToBlock: number
) {
    const genericMessages = await getTranslations("GenericMessages");

    const { isAuth, userId } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    if (!matchId || !teamNumber || typeof spotsToBlock !== 'number') {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Check if the authenticated user is a system admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (userError || !userData?.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Update the blocked spots for the specified team
    const columnToUpdate = teamNumber === 1 ? 'block_spots_team1' : 'block_spots_team2';

    const { error: updateError } = await supabase
        .from('matches')
        .update({ [columnToUpdate]: spotsToBlock })
        .eq('id', matchId);

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages('SPOTS_BLOCKED_SUCCESSFULLY')
    };
}