"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

export async function adminToggleMatchAdmin(
    authToken: string,
    matchId: string,
    playerId: string
) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    if (!matchId || !playerId) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Check if the authenticated user is an admin
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', payload.sub)
        .single();

    if (userError || !userData || !userData.isAdmin) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Fetch current match admin status
    const { data: currentStatus, error: statusError } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .match({ match_id: matchId, user_id: playerId })
        .single();

    if (statusError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Toggle the match admin status
    const newStatus = !currentStatus.has_match_admin;

    const { error: updateError } = await supabase
        .from('match_players')
        .update({ has_match_admin: newStatus })
        .match({ match_id: matchId, user_id: playerId });

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages('MATCH_ADMIN_STATUS_UPDATED'),
        data: { newStatus }
    };
}
