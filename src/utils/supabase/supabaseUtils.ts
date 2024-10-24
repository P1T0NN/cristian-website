// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { typesNewUser } from '@/types/typesUser';
import type { typesVerificationToken } from '@/types/typesVerificationToken';

export const checkUserExists = async (email: string) => {
    // Use select('*') to get the user data
    const { data: existingUsers, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);

    if (error) {
        // Return null for existingUser and the error if there is one
        return { existingUser: null, error };
    }

    // Check if we found any users
    const existingUser = existingUsers.length > 0;

    return { existingUser, error: null };
};

export const insertUser = async (user: typesNewUser) => {
    const { error } = await supabase
        .from('users')
        .insert([user]);
    
    return error;
};

export const getUserByEmail = async (email: string) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, is_verified, password')
        .eq('email', email)
        .single();

    return { user, error };
};

export const insertVerificationToken = async (verification: typesVerificationToken) => {
    const { error } = await supabase
        .from('user_verifications')
        .insert([verification]);
    
    return error;
};

export async function deleteOldVerificationToken(userId: string) {
    const { error } = await supabase
        .from('user_verifications')
        .delete()
        .eq('user_id', userId);

    return error;
}