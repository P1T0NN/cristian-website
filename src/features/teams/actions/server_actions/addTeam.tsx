"use server"

// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// LIBRARIES
import { supabase } from "@/shared/lib/supabase/supabase";
import { getTranslations } from "next-intl/server";

// SERVICES
import { upstashRedisCacheService } from "@/shared/services/server/redis-cache.service";

// CONFIG
import { CACHE_KEYS } from "@/config";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

// TYPES
import type { typesAddTeamForm } from "../../types/AddTeamForm";
import type { typesTeam } from "../../types/typesTeam";

interface AddTeamResponse {
    success: boolean;
    message: string;
    data?: typesTeam;
}

interface AddTeamParams {
    addTeamData: typesAddTeamForm;
}

export async function addTeam({ 
    addTeamData 
}: AddTeamParams): Promise<AddTeamResponse> {
    const t = await getTranslations("GenericMessages")

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!addTeamData) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { team_name, team_level } = addTeamData;

    const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .ilike('team_name', team_name);

    if (existingTeam && existingTeam.length > 0) {
        return { success: false, message: t('TEAM_ALREADY_EXISTS') };
    }

    // Insert new team if no duplicate found
    const { data, error } = await supabase
        .from('teams')
        .insert([{ team_name, team_level }])
        .select()
        .single();

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') }
    }

    // Invalidate the teams cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_TEAMS_PREFIX);

    revalidatePath("/");

    return { success: true, message: t('TEAM_ADDED_SUCCESSFULLY'), data: data as typesTeam }
}