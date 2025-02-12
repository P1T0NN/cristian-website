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

interface EditMatchResponse {
    success: boolean;
    message: string;
    data?: typesMatch;
}

interface EditMatchParams {
    matchIdFromParams: string;
    editMatchData: typesAddMatchForm;
}

export async function editMatch({
    matchIdFromParams,
    editMatchData
}: EditMatchParams): Promise<EditMatchResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth } = await verifyAuth();
        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('matches')
        .update({
            location: editMatchData.location,
            locationUrl: editMatchData.locationUrl,
            price: editMatchData.price,
            team1Name: editMatchData.team1Name,
            team2Name: editMatchData.team2Name,
            startsAtDay: editMatchData.startsAtDay,
            startsAtHour: editMatchData.startsAtHour,
            matchType: editMatchData.matchType,
            matchGender: editMatchData.matchGender,
            matchDuration: editMatchData.matchDuration,
            addedBy: editMatchData.addedBy,
            matchLevel: editMatchData.matchLevel
        })
        .eq('id', matchIdFromParams)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('MATCH_EDIT_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t("MATCH_UPDATED"), data: data as typesMatch };
}