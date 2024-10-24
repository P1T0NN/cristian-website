// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';
import { getTranslations } from 'next-intl/server';
import { applyRateLimit } from '@/lib/ratelimit/rateLimiter';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';
import type { typesAddDebtForm } from '@/types/forms/AddDebtForm';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const genericMessages = await getTranslations("GenericMessages");

    const rateLimitResult = await applyRateLimit(req, 'addDebt');
    if (!rateLimitResult.success) {
        return NextResponse.json({ success: false, message: genericMessages('DEBT_CREATION_RATE_LIMITED') }, { status: 429 });
    }
    
    const debtData: typesAddDebtForm = await req.json();

    const { data, error } = await supabase
        .from('debts')
        .insert([
            {
                player_name: debtData.player_name,
                player_debt: debtData.player_debt,
                cristian_debt: debtData.cristian_debt,
                reason: debtData.reason,
                added_by: debtData.added_by
            }
        ]);

    if (error) {
        return NextResponse.json({ success: false, message: genericMessages('DEBT_CREATION_FAILED') }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: genericMessages("DEBT_CREATED"), data });
}