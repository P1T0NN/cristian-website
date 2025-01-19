"use server"

// NEXTJS IMPORTS
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/config';

// ACTIONS
import { verifyAuth } from "@/features/auth/actions/verifyAuth";

interface UpdatePlayerMatchAdminParams {
    matchIdFromParams: string;
    matchPlayerId: string;
    currentValue: boolean;
    isCurrentUserAdmin: boolean;
}

interface UpdatePlayerMatchAdminResponse {
    success: boolean;
    message: string;
}

export async function updatePlayerMatchAdmin({
    matchIdFromParams,
    matchPlayerId,
    currentValue,
    isCurrentUserAdmin
}: UpdatePlayerMatchAdminParams): Promise<UpdatePlayerMatchAdminResponse> {
    const t = await getTranslations("GenericMessages");
    
    console.log('Update Player Match Admin - Starting:', {
        matchIdFromParams,
        matchPlayerId,
        currentValue,
        isCurrentUserAdmin,
        timestamp: new Date().toISOString()
    });

    // First, let's verify the current state in the database
    const { data: currentState, error: fetchError } = await supabase
        .from('match_players')
        .select('has_match_admin')
        .eq('id', matchPlayerId)
        .single();

    console.log('Current Database State:', {
        dbValue: currentState?.has_match_admin,
        uiValue: currentValue,
        fetchError: fetchError?.message
    });

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    const { isAuth } = await verifyAuth(authToken as string);

    console.log('Auth Status:', {
        isAuth,
        hasToken: !!authToken,
        isCurrentUserAdmin
    });

    if (!isAuth || !isCurrentUserAdmin) {
        console.log('Authorization Failed:', {
            isAuth,
            isCurrentUserAdmin,
            reason: !isAuth ? 'Not authenticated' : 'Not an admin'
        });
        return { success: false, message: t('UNAUTHORIZED') };
    }

    // Use the database value instead of UI value
    const actualCurrentValue = currentState?.has_match_admin ?? false;

    console.log('Updating match player admin status:', {
        matchPlayerId,
        dbValue: actualCurrentValue,
        uiValue: currentValue,
        newValue: !actualCurrentValue
    });

    const { error } = await supabase
        .from('match_players')
        .update({ has_match_admin: !actualCurrentValue })
        .eq('id', matchPlayerId)
        .eq('match_id', matchIdFromParams);

    if (error) {
        console.log('Update Failed:', {
            error: error.message,
            code: error.code,
            details: error.details
        });
        return { success: false, message: t('OPERATION_FAILED') };
    }

    console.log('Revalidating path');
    revalidatePath(`${PROTECTED_PAGE_ENDPOINTS.MATCH_PAGE}/${matchIdFromParams}`);

    console.log('Operation Completed Successfully:', {
        matchId: matchIdFromParams,
        matchPlayerId,
        oldValue: actualCurrentValue,
        newValue: !actualCurrentValue,
        timestamp: new Date().toISOString()
    });

    return { 
        success: true, 
        message: t('MATCH_ADMIN_STATUS_UPDATED')
    };
}