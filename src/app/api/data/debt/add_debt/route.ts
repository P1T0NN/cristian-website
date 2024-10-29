// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesAddDebtForm } from '@/types/forms/AddDebtForm';
import type { typesUser } from "@/types/typesUser";

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");
    const fetchMessages = await getTranslations("FetchMessages");

    const rateLimitResult = await applyRateLimit(req, 'addDebt');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('DEBT_CREATION_RATE_LIMITED') }, { status: 429 });
    }
    
    const debtData: typesAddDebtForm = await req.json();

    // Parallel execution of debt insertion and user fetch
    const [debtInsertResult, userFetchResult] = await Promise.all([
        supabase
            .from('debts')
            .insert([
                {
                    player_name: debtData.player_name,
                    player_debt: debtData.player_debt,
                    cristian_debt: debtData.cristian_debt,
                    reason: debtData.reason,
                    added_by: debtData.added_by
                }
            ])
            .select(),
        supabase
            .from('users')
            .select('*')
            .eq('fullName', debtData.player_name)
            .single()
    ]);

    if (debtInsertResult.error) {
        return NextResponse.json({ success: false, message: genericMessages('DEBT_CREATION_FAILED') }, { status: 400 });
    }

    if (userFetchResult.error) {
        return NextResponse.json({ success: false, message: fetchMessages('USER_FETCH_FAILED') }, { status: 400 });
    }

    const user = userFetchResult.data as typesUser;

    // Calculate new debt values
    const newPlayerDebt = user.player_debt + (debtData.player_debt || 0);
    const newCristianDebt = user.cristian_debt + (debtData.cristian_debt || 0);

    // Update users table
    const { data: userUpdateData, error: userUpdateError } = await supabase
        .from('users')
        .update({
            player_debt: newPlayerDebt,
            cristian_debt: newCristianDebt
        })
        .eq('fullName', debtData.player_name)
        .select();

    if (userUpdateError) {
        return NextResponse.json({ success: false, message: genericMessages('USER_DEBT_UPDATE_FAILED') }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true, 
        message: genericMessages("DEBT_CREATED_AND_USER_UPDATED"), 
        data: { debt: debtInsertResult.data, user: userUpdateData } 
    });
}