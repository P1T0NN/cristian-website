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

interface VerifyDocumentsResponse {
    success: boolean;
    message: string;
    data?: typesUser;
}

interface VerifyDocumentsParams {
    playerIdFromParams: string;
}

export async function verifyDocuments({ 
    playerIdFromParams
}: VerifyDocumentsParams): Promise<VerifyDocumentsResponse> {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    const { isAuth, userId: adminId } = await verifyAuth(authToken as string);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    if (!playerIdFromParams) {
        return { success: false, message: t('BAD_REQUEST') };
    }

    // Check if the user is an admin
    const { data: adminUser } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', adminId)
        .single();

    if (!adminUser?.isAdmin) {
        return { success: false, message: t('UNAUTHORIZED') };
    }

    const { data, error } = await supabase
        .from('users')
        .update({ verify_documents: true })
        .eq('id', playerIdFromParams)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('VERIFY_DOCUMENTS_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('DOCUMENTS_VERIFIED_SUCCESSFULLY'), data: data as typesUser };
}