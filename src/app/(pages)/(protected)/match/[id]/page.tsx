// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { MatchContent } from "@/components/(pages)/(protected)/match/[id]/match-content";
import { MatchLoading } from "@/components/(pages)/(protected)/match/[id]/match-loading";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import type { typesUser } from "@/types/typesUser";

async function MatchPageContent({ 
    params 
}: { 
    params: Promise<{ id: string }>
}) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const { id } = await params;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return (
            <main className="flex flex-col w-full min-h-screen">
                <ErrorMessage message={result.message} />
            </main>
        );
    }

    const userData = result.data as typesUser;

    return (
        <main>
            <MatchContent matchId={id} authToken={authToken} currentUserId={userData.id} />
        </main>
    );
}

export default function MatchPage({ 
    params 
}: { 
    params: Promise<{ id: string }>
}) {
    return (
        <Suspense fallback={<MatchLoading />}>
            <MatchPageContent params={params} />
        </Suspense>
    );
}