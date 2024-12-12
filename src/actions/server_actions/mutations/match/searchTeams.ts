"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
type SearchResult = {
    teams: { id: string; team_name: string }[];
}

export async function searchTeams(authToken: string, query: string): Promise<{ success: boolean; message?: string; data?: SearchResult }> {
    const genericMessages = await getTranslations("GenericMessages")

    const { isAuth } = await verifyAuth(authToken);
                
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Search for teams
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name')
        .ilike('team_name', `${query}%`)
        .limit(5)

    if (teamsError) {
        return { success: false, message: genericMessages('TEAM_SEARCH_FAILED') }
    }

    return { 
        success: true, 
        data: { 
            teams: teams || []
        } 
    }
}