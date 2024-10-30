// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { SettingsContent } from "@/components/(pages)/(protected)/settings/settings-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { SettingsLoading } from "@/components/(pages)/(protected)/settings/settings-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

async function SettingsPageContent() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return <ErrorMessage message={result.message} />;
    }

    const userData = result.data as typesUser;

    return (
        <main className="flex flex-col w-full min-h-screen">
            <SettingsContent serverUserData={userData} authToken={authToken} />
        </main>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<SettingsLoading />}>
            <SettingsPageContent />
        </Suspense>
    );
}