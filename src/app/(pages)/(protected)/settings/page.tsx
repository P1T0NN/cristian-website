// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";
import { SettingsContent } from "@/components/(pages)/(protected)/settings/settings-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function SettingsPage() {
    const result = await server_fetchUserData();
    
    if (!result.success) {
        return <ErrorMessage message={result.message} />;
    }

    const userData = result.data as typesUser;

    return (
        <main>
            <HeaderProtected serverUserData={userData} />

            <SettingsContent />
        </main>
    )
}