"use server"

// NEXTJS IMPORTS
import { revalidatePath } from "next/cache";

// LIBRARIES
import { supabase } from "@/shared/lib/supabase/supabase";
import { getTranslations } from "next-intl/server";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

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

    const { isAuth } = await verifyAuth();
                        
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

    revalidatePath("/");

    return { success: true, message: t('TEAM_DELETED_SUCCESSFULLY') }
}