"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
type SearchResult = {
    users: { id: string; fullName: string }[];
    teams: { id: string; team_name: string }[];
}

export async function searchBar(authToken: string, query: string): Promise<{ success: boolean; message?: string; data?: SearchResult }> {
    const genericMessages = await getTranslations("GenericMessages")

   const { isAuth } = await verifyAuth(authToken);
                       
    if (!isAuth) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    // Search for users
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, fullName')
        .ilike('fullName', `${query}%`)
        .limit(5)

    if (usersError) {
        return { success: false, message: genericMessages('USER_SEARCH_FAILED') };
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
            users: users || [], 
            teams: teams || []
        } 
    }
}