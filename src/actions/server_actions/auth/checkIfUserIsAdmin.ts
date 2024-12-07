'use server'

// NEXTJS IMPORTS
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { verifyToken } from '@/utils/auth/jwt';

export async function checkIfUserIsAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    const payload = await verifyToken(authToken as string);
    
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