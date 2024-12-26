"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/auth/verifyAuth';

// TYPES
import type { typesUser } from '@/types/typesUser';

interface GrantUserAccessResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface GrantUserAccessParams {
    userId: string;
}

export async function grantUserAccess({ 
    userId 
}: GrantUserAccessParams): Promise<GrantUserAccessResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!userId) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ has_access: true })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('USER_GRANT_ACCESS_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('USER_ACCESS_GRANTED_SUCCESSFULLY'), data: data as typesUser };
}