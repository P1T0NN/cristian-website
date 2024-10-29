// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";
import { AddMatchContent } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function AddMatchPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return <ErrorMessage message={result.message} />;
    }

    const userData = result.data as typesUser;

    // If user is not Admin redirect him to Home Page
    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <main className="flex flex-col w-full min-h-screen">
            <HeaderProtected serverUserData={userData} authToken={authToken} />

            <Suspense fallback={<p>Loading...</p>}>
                <AddMatchContent authToken={authToken} serverUserData={userData} />
            </Suspense>
        </main>
    )
}