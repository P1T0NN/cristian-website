"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { jwtVerify } from 'jose';

// TYPES
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';

export async function addMatch(authToken: string, addMatchData: typesAddMatchForm) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const { data, error } = await supabase
        .from('matches')
        .insert([
            {
                location: addMatchData.location,
                location_url: addMatchData.location_url,
                price: addMatchData.price,
                team1_name: addMatchData.team1_name,
                team2_name: addMatchData.team2_name,
                starts_at_day: addMatchData.starts_at_day,
                starts_at_hour: addMatchData.starts_at_hour,
                match_type: addMatchData.match_type,
                match_gender: addMatchData.match_gender,
                match_duration: addMatchData.match_duration,
                added_by: addMatchData.added_by,
                match_level: addMatchData.match_level,
                has_teams: addMatchData.has_teams
            }
        ]);

    if (error) {
        return { success: false, message: genericMessages('MATCH_CREATION_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_CREATED"), data };
}