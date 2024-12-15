// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { getTranslations } from 'next-intl/server';
import { supabase } from '@/lib/supabase/supabase';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages")

    const body = await req.json();
    const { playerId } = body;

    console.log('Fetching user data', { playerId });

    if (!playerId) {
        console.error('Player ID not provided');
        return NextResponse.json({ success: false, message: genericMessages('PLAYER_ID_REQUIRED') });
    }

    // Fetch user data first
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', playerId)
        .single();

    if (userError || !user) {
        console.error('User not found', { playerId, error: userError });
        return NextResponse.json({ success: false, message: genericMessages('USER_NOT_FOUND') });
    }

    console.log('User data fetched', { userId: user.id, fullName: user.fullName });

    // Fetch debts using the user's fullName
    const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('player_name', user.fullName);

    if (debtsError) {
        console.error('Error fetching debts', { fullName: user.fullName, error: debtsError });
    } else {
        console.log('Debts fetched', { fullName: user.fullName, debtCount: debts?.length });
    }

    // Fetch balances using the user's fullName
    const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*')
        .eq('player_name', user.fullName);

    if (balancesError) {
        console.error('Error fetching balances', { fullName: user.fullName, error: balancesError });
    } else {
        console.log('Balances fetched', { fullName: user.fullName, balanceCount: balances?.length });
    }

    // If there's an error fetching debts or balances, we'll just set them to empty arrays
    const userDebts = debtsError ? [] : debts;
    const userBalances = balancesError ? [] : balances;

    // Combine user data with debts and balances
    const userData = {
        ...user,
        debts: userDebts,
        balances: userBalances
    };

    console.log('User data compiled', { 
        userId: user.id, 
        fullName: user.fullName, 
        debtCount: userDebts.length, 
        balanceCount: userBalances.length 
    });

    return NextResponse.json({ success: true, message: fetchMessages('USER_FETCHED'), data: userData });
}