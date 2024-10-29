// NEXTJS IMPORTS
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { HeaderProtected } from "@/components/ui/header/header_protected";
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { EditMatchContent } from "@/components/(pages)/(protected)/(admin)/edit_match/[id]/edit-match-content";

// ACTIONS
import { server_fetchUserData } from "@/actions/functions/data/server/server_fetchUserData";

// TYPES
import type { typesUser } from "@/types/typesUser";

export default async function EditMatchPage({
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

            <EditMatchContent matchId={id} authToken={authToken} />
        </main>
    )
}