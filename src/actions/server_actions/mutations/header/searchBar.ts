"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// I made custom User and Team interfaces because I was lazy to add them in respected typesUser and typesTeam as a reminder to why it is here
interface User {
    id: string;
    fullName: string;
}

interface Team {
    id: string;
    team_name: string;
}

interface SearchResult {
    users: User[];
    teams: Team[];
}

interface SearchBarResponse {
    success: boolean;
    message?: string;
    data?: SearchResult;
}

interface SearchBarParams {
    query: string;
}

export async function searchBar({
    query
}: SearchBarParams): Promise<SearchBarResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                       
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Search for users
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, fullName')
        .ilike('fullName', `${query}%`)
        .limit(5);

    if (usersError) {
        return { success: false, message: t('USER_SEARCH_FAILED') };
    }

    // Search for teams
    const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name')
        .ilike('team_name', `${query}%`)
        .limit(5);

    if (teamsError) {
        return { success: false, message: t('TEAM_SEARCH_FAILED') };
    }

    return { 
        success: true, 
        data: { 
            users: users || [], 
            teams: teams || []
        } 
    };
}