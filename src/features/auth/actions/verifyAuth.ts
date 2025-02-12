import 'server-only'

// REACTJS IMPORTS
import { cache } from 'react';

// NEXTJS IMPORTS
import { headers } from 'next/headers';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { auth } from '../auth';
import { getTranslations } from 'next-intl/server';

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

export const checkUserAccess = async (): Promise<boolean> => {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return false;
        }

        const { data } = await supabase
            .from('user')
            .select('hasAccess')
            .eq('id', session.user.id)
            .single();

        return data?.hasAccess ?? false;
    } catch {
        return false;
    }
}

export const getUser = cache(async () => {
    const t = await getTranslations("GenericMessages");

    try {
        const { isAuth, userId } = await verifyAuth();

        if (!isAuth) {
            return { success: false, message: t('UNAUTHORIZED') };
        }

        const { data: user } = await supabase
            .from('user')
            .select('*')
            .eq('id', userId)
            .single();

        if (!user) {
            return null;
        }

        return user as typesUser;
    } catch {
        return null;
    }
});