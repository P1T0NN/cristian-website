// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { HeaderProtected } from '@/components/ui/header/header_protected';
import { HomeContent } from '@/components/(pages)/(protected)/home/home-content';
import { ErrorMessage } from '@/components/ui/errors/error-message';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

export default async function HomePage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return <ErrorMessage message={result.message} />;
    }

    const userData = result.data as typesUser;

    return (
        <main>
            <HeaderProtected serverUserData={userData} authToken={authToken} />
            
            <Suspense fallback={<p>Loading...</p>}>
                <HomeContent authToken={authToken} serverUserData={userData} />
            </Suspense>
        </main>
    );
}