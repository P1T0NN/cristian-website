// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { PlayerContent } from '@/components/(pages)/(protected)/player/[id]/player-content';
import { ErrorMessage } from '@/components/ui/errors/error-message';
import { PlayerLoading } from '@/components/(pages)/(protected)/player/[id]/player-loading';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

async function PlayerPageContent({ 
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

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <main>
            <PlayerContent authToken={authToken} playerId={id} currentUserData={userData} />
        </main>
    );
}

export default function PlayerPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    return (
        <Suspense fallback={<PlayerLoading />}>
            <PlayerPageContent params={params} />
        </Suspense>
    );
}