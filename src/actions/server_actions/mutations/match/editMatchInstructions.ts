"use server"

// NEXTJS IMPORTS
import { revalidatePath } from "next/cache";

// LIBRARIES
import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabase/supabase";
import { serverActionRateLimit } from "@/lib/ratelimit/server_actions/serverActionRateLimit";
import { jwtVerify } from "jose";

// SERVICES
import { redisCacheService } from "@/services/server/redis-cache.service";

// CONFIG
import { CACHE_KEYS } from "@/config";

export const editMatchInstructions = async (
    instructions: string, 
    matchId: string,
    authToken: string
) => {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') }
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    const rateLimitResult = await serverActionRateLimit('editMatchInstructions');
    if (!rateLimitResult.success) {
        return { success: false, message: genericMessages('MATCH_INSTRUCTIONS_EDIT_RATE_LIMITED') };
    }

    if (!matchId) {
        return { success: false, message: genericMessages('MATCH_ID_INVALID') };
    }

    const { error } = await supabase
        .from('matches')
        .update({ match_instructions: instructions })
        .eq('id', matchId);

    if (error) {
        return { success: false, message: genericMessages('MATCH_INSTRUCTIONS_EDIT_FAILED') };
    }

    // Invalidate the specific match cache
    await redisCacheService.delete(`${CACHE_KEYS.MATCH_PREFIX}${matchId}`);

    revalidatePath("/");

    return { success: true, message: genericMessages("MATCH_INSTRUCTIONS_UPDATED") };
}