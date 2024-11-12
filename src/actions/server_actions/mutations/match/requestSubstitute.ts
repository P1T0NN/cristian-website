"use server"

// NEXTJS IMPORTS
import { revalidatePath } from 'next/cache';

// LIBRARIES
import { jwtVerify } from 'jose';
import { getTranslations } from 'next-intl/server';

export async function requestSubstitute(
    authToken: string,
    matchId: string,
    playerId: string
) {
    const genericMessages = await getTranslations("GenericMessages");

    if (!authToken) {
        return { success: false, message: genericMessages('UNAUTHORIZED') };
    }

    const { payload } = await jwtVerify(authToken, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload) {
        return { success: false, message: genericMessages('JWT_DECODE_ERROR') };
    }

    if (!matchId || !playerId) {
        return { success: false, message: genericMessages('INVALID_REQUEST') };
    }

    // Here you would implement the logic to request a substitute
    // This might involve updating the database, sending notifications, etc.
    
    // For now, we'll just simulate a successful request
    await new Promise(resolve => setTimeout(resolve, 1000));

    revalidatePath("/");

    return { success: true, message: genericMessages('SUBSTITUTE_REQUESTED_SUCCESSFULLY') };
}