// NEXTJS IMPORTS
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// LIBRARIES
import { supabase } from '@/lib/supabase/supabase';

// UTILS
import { verifyToken } from '@/utils/auth/jwt';

export async function POST() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(authToken);
    
    const { error } = await supabase
        .from('refresh_tokens')
        .delete()
        .eq('user_id', payload.sub);

    if (error) {
        return NextResponse.json({ success: false, message: "Error deleting refresh token!"} );
    }

    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
}