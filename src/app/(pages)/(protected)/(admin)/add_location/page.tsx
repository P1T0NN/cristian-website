// REACTJS IMPORTS
import { Suspense } from "react";

// NEXTJS IMPORTS
import { redirect } from "next/navigation";

// CONFIG
import { PAGE_ENDPOINTS } from "@/config";

// COMPONENTS
import { AddLocationContent } from "@/components/(pages)/(protected)/(admin)/add_location/add-location-content";
import { ErrorMessage } from "@/components/ui/errors/error-message";
import { AddLocationLoading } from "@/components/(pages)/(protected)/(admin)/add_location/add-location-loading";

// ACTIONS
import { server_fetchUserData } from '@/actions/functions/data/server/server_fetchUserData';

// TYPES
import type { typesUser } from "@/types/typesUser";

async function AddLocationPageContent() {
    const result = await server_fetchUserData();
    
    if (!result.success) {
        return (
            <main className="flex flex-col w-full min-h-screen">
                <ErrorMessage message={result.message} />
            </main>
        );
    }

    const userData = result.data as typesUser;

    // If user is not Admin redirect him to Home Page
    if (!userData.isAdmin) {
        redirect(PAGE_ENDPOINTS.HOME_PAGE);
    }

    return (
        <main>
            <AddLocationContent />
        </main>
    );
}

export default function AddLocationPage() {
    return (
        <Suspense fallback={<AddLocationLoading />}>
            <AddLocationPageContent />
        </Suspense>
    );
}