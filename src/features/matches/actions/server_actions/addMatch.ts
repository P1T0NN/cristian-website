"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesAddMatchForm } from '../../types/AddMatchForm';
import type { typesMatch } from '../../types/typesMatch';

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

    const { isAuth } = await verifyAuth();
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Convert match_level to uppercase
    const uppercaseMatchLevel = addMatchData.matchLevel.toUpperCase();

    const { data, error } = await supabase
        .from('matches')
        .insert([
            {
                location: addMatchData.location,
                locationUrl: addMatchData.locationUrl,
                price: addMatchData.price,
                team1Name: addMatchData.team1Name,
                team2Name: addMatchData.team2Name,
                startsAtDay: addMatchData.startsAtDay,
                startsAtHour: addMatchData.startsAtHour,
                matchType: addMatchData.matchType,
                matchGender: addMatchData.matchGender,
                matchDuration: addMatchData.matchDuration,
                addedBy: addMatchData.addedBy,
                matchLevel: uppercaseMatchLevel,
                hasTeams: addMatchData.hasTeams,
                status: addMatchData.status
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