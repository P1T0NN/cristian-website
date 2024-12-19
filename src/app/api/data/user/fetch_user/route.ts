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

    if (!playerId) {
        return NextResponse.json({ success: false, message: genericMessages('INTERNAL_SERVER_ERROR') });
    }

    // Fetch user data first
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', playerId)
        .single();

    if (userError || !user) {
        return NextResponse.json({ success: false, message: genericMessages('USER_NOT_FOUND') });
    }

    // Fetch debts using the user's fullName
    const { data: debts, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('player_name', user.fullName);

    if (debtsError) {
        return NextResponse.json({ success: false, message: genericMessages('INTERNAL_SERVER_ERROR') }); // I put this because I am lazy to add new translation
    }

    // Fetch balances using the user's fullName
    const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*')
        .eq('player_name', user.fullName);

    if (balancesError) {
        return NextResponse.json({ success: false, message: genericMessages('INTERNAL_SERVER_ERROR') }); // I put this because I am lazy to add new translation
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

    return NextResponse.json({ success: true, message: fetchMessages('USER_FETCHED'), data: userData });
}