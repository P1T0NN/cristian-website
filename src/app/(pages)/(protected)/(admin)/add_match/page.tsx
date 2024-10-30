// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { AddMatchContent } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { AddMatchLoading } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

async function AddMatchPageContent() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return <ErrorMessage message={result.message} />;
    }

    const userData = result.data as typesUser;

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <main className="flex flex-col w-full min-h-screen">
            <AddMatchContent authToken={authToken} serverUserData={userData} />
        </main>
    );
}

export default function AddMatchPage() {
    return (
        <Suspense fallback={<AddMatchLoading />}>
            <AddMatchPageContent />
        </Suspense>
    );
}