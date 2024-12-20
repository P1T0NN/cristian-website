// NEXTJS IMPORTS
import { NextResponse } from 'next/server';

// TYPES
import type { APIResponse } from '@/types/responses/APIResponse';

// THIS IS NOT ACTUAL LOGOUT FUNCTION. WHEN WE ARE LOGGED IN AND CLICK "LOGOUT" THIS FUNCTION DOESN'T GET CALLED, THIS FUNCTION IS JUST USED TO BYPASS IN "UNAUTHORIZED PAGE" ERROR 
// WHEN WE TRY TO DELETE COOKIES DIRECTLY IN SERVER ACTION, BECAUSE IT WILL NOT WORK, SO WE HAVE TO CALL THIS ROUTE INSTEAD!!!
export async function POST(): Promise<NextResponse<APIResponse>> {
    const response = NextResponse.json({ 
        success: true, 
        message: "Cookies deleted successfully!" 
    });

    // Clear the auth_token and refresh_token cookies
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');

    return response;
}