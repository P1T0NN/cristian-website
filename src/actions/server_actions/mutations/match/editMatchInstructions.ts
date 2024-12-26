"use server"

// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// LIBRARIES
import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabase/supabase";

// SERVICES
import { upstashRedisCacheService } from "@/services/server/redis-cache.service";

// ACTIONS
import { verifyAuth } from "@/actions/auth/verifyAuth";

// CONFIG
import { CACHE_KEYS } from "@/config";

interface EditMatchInstructionsResponse {
    success: boolean;
    message: string;
}

interface EditMatchInstructionsParams {
    matchId: string;
    matchInstructions: string;
}

export async function editMatchInstructions({
    matchId,
    matchInstructions,
}: EditMatchInstructionsParams): Promise<EditMatchInstructionsResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
       
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId || !matchInstructions) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { error } = await supabase
        .from('matches')
        .update({ match_instructions: matchInstructions })
        .eq('id', matchId);

    if (error) {
        return { success: false, message: t('MATCH_INSTRUCTIONS_EDIT_FAILED') };
    }

    // Invalidate the specific match cache
    await upstashRedisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: t("MATCH_INSTRUCTIONS_UPDATED") };
}