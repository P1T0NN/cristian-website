"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { TAGS_FOR_CACHE_REVALIDATIONS } from "@/config";

// ACTIONS
import { verifyAuth } from '@/features/auth/actions/verifyAuth';

// TYPES
import type { typesPlayer } from '@/features/players/types/typesPlayer';

interface VerifyDocumentsResponse {
    success: boolean;
    message: string;
    data?: typesPlayer;
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

    revalidateTag(TAGS_FOR_CACHE_REVALIDATIONS.PLAYERS);
    
    return { success: true, message: t('DOCUMENTS_VERIFIED_SUCCESSFULLY'), data: data as typesPlayer };
}