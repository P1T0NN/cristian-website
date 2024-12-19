"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function verifyDocuments(authToken: string, userId: string): Promise<APIResponse> {
    const t = await getTranslations("GenericMessages");

    const { isAuth, userId: adminId } = await verifyAuth(authToken);
                        
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
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
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, message: t('VERIFY_DOCUMENTS_FAILED') };
    }

    revalidatePath('/');
    return { success: true, message: t('DOCUMENTS_VERIFIED_SUCCESSFULLY'), data };
}