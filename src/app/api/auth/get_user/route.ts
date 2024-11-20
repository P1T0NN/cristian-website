// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// ACTIONS
import { verifyAuth } from '@/actions/actions/auth/verifyAuth';

export async function GET() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const { isAuth, userId } = await verifyAuth(authToken);

    if (!isAuth) {
        return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        message: 'User found',
        data: user
    });
}