"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

interface TeamSearchResult {
    id: string;
    team_name: string;
}

interface SearchResult {
    teams: TeamSearchResult[];
}

interface SearchTeamsResponse {
    success: boolean;
    message?: string;
    data?: SearchResult;
}

interface SearchTeamsParams {
    query: string;
}

export async function searchTeams({
    query
}: SearchTeamsParams): Promise<SearchTeamsResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
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
            teams: (teams as TeamSearchResult[]) || []
        } 
    };
}