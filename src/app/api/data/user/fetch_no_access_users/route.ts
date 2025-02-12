// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = async (_request: NextRequest): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const { data: users, error } = await supabase
        .from('user')
        .select('id, email, name, gender, phoneNumber, playerLevel')
        .eq('hasAccess', false);

    if (error) {
        return NextResponse.json({ success: false, message: t('USERS_FAILED_TO_FETCH') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('USERS_WITH_NO_ACCESS_FETCHED'), data: users });
};