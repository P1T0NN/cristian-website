// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/shared/lib/supabase/supabase';

// MIDDLEWARE
import { withAuth } from '@/shared/middleware/withAuth';

// UTILS
import { decrypt } from '@/shared/utils/encryption';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const encryptedPlayerName = searchParams.get('playerName');

    if (!encryptedPlayerName) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }

    const playerName = decrypt(encryptedPlayerName);

    // Fetch user ID by name
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('fullName', playerName)
        .single();

    if (userError || !user) {
        return NextResponse.json({ success: false, message: t('USER_NOT_FOUND') });
    }

    return NextResponse.json({ success: true, message: t('USER_ID_FETCHED'), data: { id: user.id } });
});