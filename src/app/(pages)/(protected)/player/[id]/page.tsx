// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { HeaderProtected } from '@/components/ui/header/header_protected';
import { PlayerContent } from '@/components/(pages)/(protected)/player/[id]/player-content';
import { ErrorMessage } from '@/components/ui/errors/error-message';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

export default async function PlayerPage({
    params,
}: {
    params: { id: string }
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
        <main>
            <HeaderProtected serverUserData={userData} authToken={authToken} />
            
            <Suspense fallback={<p>Loading...</p>}>
                <PlayerContent authToken={authToken} playerId={id} currentUserData={userData} />
            </Suspense>
        </main>
    );
}