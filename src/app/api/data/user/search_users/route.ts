// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || '7';

    if (!search) {
        return NextResponse.json({ success: true, message: t('NO_SEARCH_TERM'), data: [] });
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, fullName, email')
        .ilike('fullName', `%${search}%`)
        .order('fullName')
        .limit(Number(limit));

    if (error) {
        return NextResponse.json({ success: false, message: t('FAILED_TO_SEARCH_USERS') }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: t('USERS_FETCHED'), data });
});