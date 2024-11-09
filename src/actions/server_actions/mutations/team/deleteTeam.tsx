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

export async function deleteTeam(authToken: string, teamId: string) {
    const t = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: t('JWT_DECODE_ERROR') };
    }

    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

    if (error) {
        return { success: false, message: t('OPERATION_FAILED') }
    }

    // Invalidate the teams cache
    await upstashRedisCacheService.delete(CACHE_KEYS.ALL_TEAMS_PREFIX);

    revalidatePath("/");

    return { success: true, message: t('TEAM_DELETED_SUCCESSFULLY') }
}