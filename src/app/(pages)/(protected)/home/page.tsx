// REACTJS IMPORTS
import { Suspense } from 'react';

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// SERVICES
import { getUserLocale } from '@/services/server/locale';

// COMPONENTS
import { HomeContent } from '@/components/(pages)/(protected)/home/home-content';
import { ErrorMessage } from '@/components/ui/errors/error-message';
import { HomeLoading } from '@/components/(pages)/(protected)/home/home-loading';

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from '@/types/typesUser';

async function HomePageContent() {
    const locale = await getUserLocale();
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

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
            <HomeContent authToken={authToken} serverUserData={userData} locale={locale} />
        </main>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<HomeLoading />}>
            <HomePageContent />
        </Suspense>
    );
}