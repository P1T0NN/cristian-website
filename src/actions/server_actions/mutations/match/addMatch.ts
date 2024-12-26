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
import type { typesAddMatchForm } from '@/types/forms/AddMatchForm';
import type { typesMatch } from '@/types/typesMatch';

interface AddMatchResponse {
    success: boolean;
    message: string;
    data?: typesMatch;
}

interface AddMatchParams {
    addMatchData: typesAddMatchForm;
}

export async function addMatch({ 
    addMatchData 
}: AddMatchParams): Promise<AddMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Convert match_level to uppercase
    const uppercaseMatchLevel = addMatchData.match_level.toUpperCase();

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
                match_level: uppercaseMatchLevel,
                has_teams: addMatchData.has_teams
            }
        ])
        .select()
        .single();

    if (error) {
        return { success: false, message: t('MATCH_CREATION_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t("MATCH_CREATED"), data: data as typesMatch };
}