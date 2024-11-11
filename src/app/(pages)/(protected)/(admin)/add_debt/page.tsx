// NEXTJS IMPORTS
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { AddDebtContent } from "@/components/(pages)/(protected)/(admin)/add_debt/add-debt-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

async function AddDebtPageContent() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const result = await server_fetchUserData();
    
    if (!result.success) {
        return (
            <main className="flex flex-col w-full h-screen">
                <ErrorMessage message={result.message} />
            </main>
        );
    }

    const userData = result.data as typesUser;

    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <main className="flex flex-col w-full h-screen">
            <AddDebtContent authToken={authToken} serverUserData={userData} />
        </main>
    );
}

export default function AddDebtPage() {
    return (
        <AddDebtPageContent />
    );
}