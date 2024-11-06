"use server"

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { serverActionRateLimit } from '@/lib/ratelimit/server_actions/serverActionRateLimit';
import { jwtVerify } from 'jose';

// TYPES
type SearchResult = {
    teams: { id: string; team_name: string }[];
}

export async function searchTeams(authToken: string, query: string): Promise<{ success: boolean; message?: string; data?: SearchResult }> {
    const genericMessages = await getTranslations("GenericMessages")

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET))

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') }
    }

    const rateLimitResult = await serverActionRateLimit('searchTeams')
    if (!rateLimitResult.success) {
        return { success: false, message: genericMessages('SEARCH_TEAMS_RATE_LIMITED') }
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