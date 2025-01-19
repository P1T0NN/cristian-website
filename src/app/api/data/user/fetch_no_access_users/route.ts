// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (_request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, fullName, gender, phoneNumber, player_level')
        .eq('has_access', false);

    if (error) {
        return NextResponse.json({ success: false, message: t('USERS_FAILED_TO_FETCH') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('USERS_WITH_NO_ACCESS_FETCHED'), data: users });
});