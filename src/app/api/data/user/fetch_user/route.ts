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
        return NextResponse.json({ success: false, message: genericMessages('PLAYER_ID_REQUIRED') });
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

    // If there's an error fetching debts, we'll just set it to an empty array
    const userDebts = debtsError ? [] : debts;

    // Combine user data with debts
    const userData = {
        ...user,
        debts: userDebts
    };

    return NextResponse.json({ success: true, message: fetchMessages('USER_FETCHED'), data: userData });
}