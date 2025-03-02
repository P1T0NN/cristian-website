import 'server-only'

// REACTJS IMPORTS
import { cache } from 'react';

// NEXTJS IMPORTS
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { auth } from '../auth';

// CONFIG
import { PUBLIC_PAGE_ENDPOINTS } from '@/config';

// TYPES
import type { typesUser } from '@/features/players/types/typesPlayer';

export const verifyAuth = cache(async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return { isAuth: false, userId: null };
    }

    // Ensure we have a valid user ID
    if (!session.user.id) {
        return { isAuth: false, userId: null };
    }

    return { isAuth: true, userId: session.user.id };
});

export const checkUserAccess = cache(async (): Promise<{ hasAccess: boolean, country?: string }> => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { hasAccess: false };
        }

        const { data } = await supabase
            .from('user')
            .select('hasAccess, country')
            .eq('id', session.user.id)
            .single();

        return { 
            hasAccess: data?.hasAccess ?? false,
            country: data?.country
        };
    } catch {
        return { hasAccess: false };
    }
})

export const getUser = cache(async () => {
    const { isAuth, userId } = await verifyAuth();

    if (!isAuth) {
        return redirect(PUBLIC_PAGE_ENDPOINTS.UNAUTHORIZED_PAGE);
    }

    const { data: user } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single();
        
    if(!user.hasAccess) {
        return redirect(PUBLIC_PAGE_ENDPOINTS.UNAUTHORIZED_PAGE);
    }

    return user as typesUser;
});