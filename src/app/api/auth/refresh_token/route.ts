// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// LIBRARIES
import { supabase } from '@/shared/lib/supabase/supabase';

// UTILS
import { generateToken } from '@/features/auth/utils/jwt';

// TYPES
import type { APIResponse } from '@/shared/types/responses/APIResponse';

export async function POST(req: Request): Promise<NextResponse<APIResponse>> {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
        return NextResponse.json({ success: false, message: 'Refresh token is required' });
    }

    const { data: tokenData, error: tokenError } = await supabase
        .from('refresh_tokens')
        .select('user_id')
        .eq('token', refreshToken)
        .single();

    if (tokenError || !tokenData) {
        return NextResponse.json({ success: false, message: 'Invalid refresh token' });
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('isAdmin, has_access')
        .eq('id', tokenData.user_id)
        .single();

    if (userError || !userData) {
        return NextResponse.json({ success: false, message: 'User not found' });
    }

    const newAuthToken = await generateToken(tokenData.user_id, userData.isAdmin, userData.has_access);

    return NextResponse.json({ 
        success: true, 
        message: 'Token refreshed successfully',
        data: {
            newAuthToken
        }
    });
}