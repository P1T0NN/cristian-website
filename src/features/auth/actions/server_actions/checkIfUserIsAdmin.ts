'use server'

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from "next-intl/server";

// UTILS
import { verifyAuth } from '../verifyAuth';

interface AdminCheckResponse {
    success: boolean;
    message?: string;
    isAdmin: boolean;
}

export async function checkIfUserIsAdmin(): Promise<AdminCheckResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return { success: false, message: t('UNAUTHORIZED'), isAdmin: false };
    }

    const { userId } = await verifyAuth(authToken);
    
    const { data, error } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', userId)
        .single();

    if (error) {
        return { success: false, message: t('USER_FETCH_FAILED'), isAdmin: false };
    }

    return { success: true, isAdmin: data?.isAdmin || false };
}