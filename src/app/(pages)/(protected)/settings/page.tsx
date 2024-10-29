// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";
import { SettingsContent } from "@/components/(pages)/(protected)/settings/settings-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function SettingsPage() {
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

            <SettingsContent serverUserData={userData} authToken={authToken} />
        </main>
    )
}