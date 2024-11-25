// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { AddDebtContent } from "@/components/(pages)/(protected)/(admin)/add_debt/add-debt-content";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// TYPES
import type { typesUser } from "@/types/typesUser";

async function AddDebtPageContent() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await getUser() as typesUser;

    return (
        <main className="flex flex-col w-full min-h-screen p-4 sm:p-6 lg:p-8">
            <AddDebtContent authToken={authToken} serverUserData={serverUserData} />
        </main>
    );
}

export default function AddDebtPage() {
    return (
        <AddDebtPageContent />
    );
}