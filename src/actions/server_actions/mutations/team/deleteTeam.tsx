"use server"

// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// LIBRARIES
import { supabase } from "@/lib/supabase/supabase";
import { getTranslations } from "next-intl/server";

// SERVICES
import { upstashRedisCacheService } from "@/services/server/redis-cache.service";

// ACTIONS
import { verifyAuth } from "@/actions/auth/verifyAuth";

// CONFIG
import { CACHE_KEYS } from "@/config";

interface DeleteTeamResponse {
    success: boolean;
    message: string;
}

interface DeleteTeamParams {
    teamId: string;
}

export async function deleteTeam({ 
    teamId 
}: DeleteTeamParams): Promise<DeleteTeamResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!teamId) {
        return { success: false, message: t('BAD_REQUEST') };
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