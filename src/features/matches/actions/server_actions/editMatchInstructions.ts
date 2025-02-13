"use server"

// NEXTJS IMPORTS
import { revalidatePath } from "next/cache";

// LIBRARIES
import { getTranslations } from "next-intl/server";
import { supabase } from "@/shared/lib/supabase/supabase";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

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

    const { isAuth } = await verifyAuth();
       
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!matchId || !matchInstructions) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { error } = await supabase
        .from('matches')
        .update({ matchInstructions: matchInstructions })
        .eq('id', matchId);

    if (error) {
        return { success: false, message: t('MATCH_INSTRUCTIONS_EDIT_FAILED') };
    }

    revalidatePath("/");

    return { success: true, message: t("MATCH_INSTRUCTIONS_UPDATED") };
}