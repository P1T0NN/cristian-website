// LIBRARIES
import { generateRandomCharacters } from '@/utils/generateRandomCharacters';
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { generateJWT } from '@/utils/auth/jwt/jwtUtils';
import { GenericMessages } from '@/utils/genericMessages';

// TYPES
import type { AuthTokensResponse } from '@/types/responses/AuthTokensResponse';

const REFRESH_TOKEN_TTL_DAYS = 7;

export const generateAuthTokens = async (userId: string): Promise<AuthTokensResponse> => {
    // Verify user exists first
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return { success: false, message: GenericMessages.USER_NOT_FOUND };
    }
    
    const accessToken = await generateJWT(userId);
    const refreshToken = generateRandomCharacters();
    const csrfToken = generateRandomCharacters();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    // First, try to update any existing refresh token for this user
    const { data: existingToken, error: selectError } = await supabase
        .from('refresh_tokens')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { // Not found
        return { success: false, message: GenericMessages.DATABASE_ERROR };
    }

    let error;
    if (existingToken) {
        const { error: updateError } = await supabase
            .from('refresh_tokens')
            .update({
                refresh_token: refreshToken,
                expires_at: expiresAt.toISOString()
            })
            .eq('user_id', userId);
        
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('refresh_tokens')
            .insert({
                user_id: userId,
                refresh_token: refreshToken,
                expires_at: expiresAt.toISOString()
            });
        
        error = insertError;
    }

    if (error) {
        return { success: false, message: GenericMessages.DATABASE_ERROR };
    }

    return {
        success: true,
        accessToken,
        refreshToken,
        csrfToken
    };
};