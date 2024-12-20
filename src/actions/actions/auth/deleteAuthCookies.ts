"use server"

// NEXTJS IMPORTS
import { cookies } from "next/headers";

export async function deleteAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete("auth_token");
    cookieStore.delete("refresh_token");
}