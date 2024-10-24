// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";

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
        <main className="flex flex-col w-full h-screen">
            <HeaderProtected serverUserData={userData} />

            <Suspense fallback={<p>Loading...</p>}>
                <AddMatchContent serverUserData={userData} />
            </Suspense>
        </main>
    )
}