"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { subHours, parseISO, isBefore } from 'date-fns';

export async function managePlayer(
    authToken: string,
    matchId: string,
    userId: string,
    teamNumber: 1 | 2,
    action: 'join' | 'leave' | 'requestSubstitute' | 'replacePlayer'
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

    // Fetch match details
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('starts_at_day, starts_at_hour')
        .eq('id', matchId)
        .single();

    if (matchError || !match) {
        return { success: false, message: genericMessages('MATCH_NOT_FOUND') };
    }

    const matchStartTime = parseISO(`${match.starts_at_day}T${match.starts_at_hour}`);
    const tenHoursBeforeMatch = subHours(matchStartTime, 10);
    const currentTime = new Date();

    if (action === 'leave' && isBefore(tenHoursBeforeMatch, currentTime)) {
        return { success: false, message: genericMessages('TOO_LATE_TO_LEAVE'), canRequestSubstitute: true };
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
    } else if (action === 'requestSubstitute') {
        const { error } = await supabase
            .from('match_players')
            .update({ substitute_requested: true })
            .match({ 
                match_id: matchId, 
                user_id: userId 
            });

        if (error) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    } else if (action === 'replacePlayer') {
        // This action requires additional parameters: the ID of the player being replaced
        // and the team number. For simplicity, we'll assume these are passed in the userId and teamNumber parameters.
        const playerToReplaceId = userId;
        
        const { error: deleteError } = await supabase
            .from('match_players')
            .delete()
            .match({ 
                match_id: matchId, 
                user_id: playerToReplaceId 
            });

        if (deleteError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }

        const { error: insertError } = await supabase
            .from('match_players')
            .insert({
                match_id: matchId,
                user_id: payload.sub as string, // Assuming the JWT payload contains the user ID in the 'sub' field
                team_number: teamNumber
            });

        if (insertError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    }

    revalidatePath("/");

    return { 
        success: true, 
        message: genericMessages(
            action === 'join' ? 'PLAYER_JOINED_SUCCESSFULLY' : 
            action === 'leave' ? 'PLAYER_LEFT_SUCCESSFULLY' :
            action === 'requestSubstitute' ? 'SUBSTITUTE_REQUESTED_SUCCESSFULLY' :
            'PLAYER_REPLACED_SUCCESSFULLY'
        ) 
    };
}