'use server'

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { verifyToken } from '@/utils/auth/jwt';

export async function checkIfUserIsAdmin(token: string): Promise<boolean> {
    const payload = await verifyToken(token);
    
    const { data, error } = await supabase
        .from('users')
        .select('isAdmin')
        .eq('id', payload.sub)
        .single();

    if (error) {
        return false;
    }

    return data?.isAdmin || false;
}