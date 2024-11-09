"use server"

// NEXTJS IMPORTS
import { revalidatePath } from "next/cache";

// LIBRARIES
import { supabase } from "@/lib/supabase/supabase";
import { getTranslations } from "next-intl/server";
import { jwtVerify } from "jose";

// SERVICES
import { upstashRedisCacheService } from "@/services/server/redis-cache.service";

// CONFIG
import { CACHE_KEYS } from "@/config";

// TYPES
import type { typesAddTeamForm } from "@/types/forms/AddTeamForm";

export async function addTeam(authToken: string, addTeamData: typesAddTeamForm) {
    const t = await getTranslations("GenericMessages")

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: t('JWT_DECODE_ERROR') };
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