import 'server-only'

// REACTJS IMPORTS
import { cache } from 'react';

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// UTILS
import { verifyToken } from '@/utils/auth/jwt';

export const verifyAuth = async (token: string) => {
    try {
        const payload = await verifyToken(token)
        return { isAuth: true, userId: payload.sub }
    } catch {
        return { isAuth: false, userId: null }
    }
}

// It is making errors with client/server side exception in production on VPS, this has to be a route when self-hosting. For now its totally ignored
/*export const verifyAuthWithRefresh = cache(async () => {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!authToken && !refreshToken) {
        redirect('/login');
    }

    if (authToken) {
        const result = await verifyAuth(authToken);
        if (result.isAuth) {
            return result;
        }
    }

    if (refreshToken) {
        const refreshResult = await refreshAuthToken(refreshToken);

        if (!refreshResult.success) {
            cookieStore.delete('refresh_token');
            redirect('/login');
        }

        return { 
            isAuth: refreshResult.isAuth, 
            userId: refreshResult.userId,
            newAuthToken: refreshResult.newAuthToken 
        }
    }

    redirect('/login');
})*/

export const checkUserAccess = async (): Promise<boolean> => {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const payload = await verifyToken(authToken as string);

    if (!payload) {
        return false;
    }

    const { data, error } = await supabase
        .from('users')
        .select('has_access')
        .eq('id', payload.sub)
        .single();

    if (error) {
        return false;
    }

    return data.has_access;
}

export const getUser = cache(async () => {
    const t = await getTranslations("GenericMessages");

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const { isAuth, userId } = await verifyAuth(authToken as string);
    
    if (!isAuth) {
        return { success: false, message: t('UNAUTHORIZED') };
    }
  
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
  
    if (error) {
        return null
    }
  
    return user;
})

/*

RUN THIS SUPABASE SQL TO CREATE USER_VERIFICATIONS TABLE

CREATE TABLE user_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create an index on the token for faster lookups
CREATE INDEX idx_user_verifications_token ON user_verifications(token);

-- Create an index on the user_id for faster lookups
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);

-- Add is_verified column to the users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

*/

/*

RUN THIS SUPABASE SQL TO CREATE REFRESH_TOKENS TABLE

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT refresh_tokens_token_key UNIQUE (token)
  );
  
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens (token);

*/

/*

CREATE TABLE reset_password_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create an index on the token for faster lookups
CREATE INDEX idx_reset_password_tokens_token ON reset_password_tokens(token);

-- Create an index on the user_id for faster lookups
CREATE INDEX idx_reset_password_tokens_user_id ON reset_password_tokens(user_id);

*/