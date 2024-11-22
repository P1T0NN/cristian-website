"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { subHours, parseISO, isBefore } from 'date-fns';

// SERVICES
import { upstashRedisCacheService } from '@/services/server/redis-cache.service';

// CONFIG
import { CACHE_KEYS } from '@/config';

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
        .select('*')
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
    
    let updatedPlacesOccupied = match.places_occupied || 0;

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

        updatedPlacesOccupied += 1;

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

        updatedPlacesOccupied = Math.max(updatedPlacesOccupied - 1, 0);

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
                user_id: payload.sub as string,
                team_number: teamNumber
            });

        if (insertError) {
            return { success: false, message: genericMessages('OPERATION_FAILED') };
        }
    }

    // Update the database
    const { error: updateError } = await supabase
        .from('matches')
        .update({ places_occupied: updatedPlacesOccupied })
        .eq('id', matchId);

    if (updateError) {
        return { success: false, message: genericMessages('OPERATION_FAILED') };
    }

    // Update the cache
    const cacheKey = `${CACHE_KEYS.MATCH_PREFIX}${matchId}`;
    const cachedMatch = await upstashRedisCacheService.get<typeof match>(cacheKey);
    
    if (cachedMatch.success && cachedMatch.data) {
        const updatedCachedMatch = { ...cachedMatch.data, places_occupied: updatedPlacesOccupied };
        await upstashRedisCacheService.set(cacheKey, updatedCachedMatch, 60 * 60 * 12); // 12 hours TTL
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