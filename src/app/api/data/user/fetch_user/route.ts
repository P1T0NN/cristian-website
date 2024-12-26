// NEXTJS IMPORTS
import { NextResponse, NextRequest } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// MIDDLEWARE
import { withAuth } from '@/middleware/withAuth';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withAuth(async (request: NextRequest, _userId: string, _token: string): Promise<NextResponse> => {
    const t = await getTranslations("GenericMessages");

    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get('playerId');

    if (!playerId) {
        return NextResponse.json({ success: false, message: t('BAD_REQUEST') });
    }

    // Fetch user data first
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', playerId)
        .single();

    if (userError || !user) {
        return NextResponse.json({ success: false, message: t('USER_NOT_FOUND') });
    }

    // Fetch debts using the user's fullName
    const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('player_name', user.fullName);

    // Fetch balances using the user's fullName
    const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*')
        .eq('player_name', user.fullName);

    // If there's an error fetching debts or balances, we'll just set them to empty arrays
    const userDebts = debtsError ? [] : debts;
    const userBalances = balancesError ? [] : balances;

    // Combine user data with debts and balances
    const userData = {
        ...user,
        debts: userDebts,
        balances: userBalances
    };

    return NextResponse.json({ success: true, message: t('USER_FETCHED'), data: userData });
});