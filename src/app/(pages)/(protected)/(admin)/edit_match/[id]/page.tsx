

// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { EditMatchContent } from "@/components/(pages)/(protected)/(admin)/edit_match/[id]/edit-match-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { EditMatchLoading } from "@/components/(pages)/(protected)/(admin)/edit_match/[id]/edit-match-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

async function EditMatchPageContent({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const { id } = await params;

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
            <EditMatchContent matchId={id} authToken={authToken} />
        </main>
    );
}

export default function EditMatchPage({ 
    params 
}: { 
    params: Promise<{ id: string }>
}) {
    return (
        <Suspense fallback={<EditMatchLoading />}>
            <EditMatchPageContent params={params} />
        </Suspense>
    );
}