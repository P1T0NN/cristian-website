"use server"

// LIBRARIES
import { getTranslations } from "next-intl/server";
import { supabase } from "@/shared/lib/supabase/supabase";

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface UpdateNewUserDetailsResponse {
    success: boolean;
    message: string;
}

type UpdateNewUserDetailsParams = {
    name: string;
    country: string;
    phoneNumber: string;
    gender: string;
    playerPosition: string;
};

export const updateNewUserDetails = async (data: UpdateNewUserDetailsParams): Promise<UpdateNewUserDetailsResponse> => {
    const t = await getTranslations('GenericMessages');
    
    const { isAuth, userId } = await verifyAuth();

    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { name, country, phoneNumber, gender, playerPosition } = data;

    await supabase
        .from('user')
        .update({
            name,
            country,
            phoneNumber,
            gender,
            playerPosition
        })
        .eq('id', userId);

    return { success: true, message: t('PROFILE_UPDATED_SUCCESSFULLY') };
}
