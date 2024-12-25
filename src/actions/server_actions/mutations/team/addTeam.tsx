"use server"

// NEXTJS IMPORTS
import { revalidatePath } from "next/cache";

// LIBRARIES
import { supabase } from "@/lib/supabase/supabase";
import { getTranslations } from "next-intl/server";

// SERVICES
import { upstashRedisCacheService } from "@/services/server/redis-cache.service";

// CONFIG
import { CACHE_KEYS } from "@/config";

// ACTIONS
import { verifyAuth } from "@/actions/actions/auth/verifyAuth";

// TYPES
import type { typesAddTeamForm } from "@/types/forms/AddTeamForm";

export async function addTeam(authToken: string, addTeamData: typesAddTeamForm) {
    const t = await getTranslations("GenericMessages")

    const { isAuth } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!addTeamData) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const team_name = addTeamData.team_name;
    const team_level = addTeamData.team_level;

    const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .ilike('team_name', team_name);

    if (existingTeam && existingTeam.length > 0) {
        return { success: false, message: t('TEAM_ALREADY_EXISTS') };
    }

    // Insert new location if no duplicate found
    const { data, error } = await supabase
        .from('teams')
        .insert([{ team_name, team_level }]);

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') }
    }

    // Invalidate the teams cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_TEAMS_PREFIX);

    revalidatePath("/");

    return { success: true, message: t('TEAM_ADDED_SUCCESSFULLY'), data }
}