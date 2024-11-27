// NEXTJS IMPORTS
import { cookies } from "next/headers";

// COMPONENTS
import { Card } from "@/components/ui/card";
import { UserDetails } from "@/components/(pages)/(protected)/(admin)/add_match/user-details";
import { AddMatchDetails } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-details";

// SERVER ACTIONS
import { getUser } from "@/actions/actions/auth/verifyAuth";

// FUNCTIONS
import { serverFetchDefaultLocations } from "@/actions/functions/data/server/server_fetchDefaultLocations";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesLocation } from "@/types/typesLocation";

export default async function AddMatchPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value as string;

    const serverUserData = await getUser() as typesUser;

    const serverDefaultLocationsData = await serverFetchDefaultLocations();
    const defaultLocationsData = serverDefaultLocationsData.data as typesLocation[];

    return (
        <section className="flex w-full min-h-screen py-6 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-2xl mx-auto">
                <UserDetails serverUserData={serverUserData} />
                <AddMatchDetails 
                    authToken={authToken} 
                    serverUserData={serverUserData} 
                    defaultLocationsData={defaultLocationsData}
                />
            </Card>
        </section>
    );
}