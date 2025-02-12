// COMPONENTS
import { Card } from "@/shared/components/ui/card";
import { UserDetails } from "@/features/matches/components/add-match/user-details";
import { AddMatchDetails } from "@/features/matches/components/add-match/add-match-details";

// ACTIONS
import { getUser } from "@/features/auth/actions/verifyAuth";
import { fetchDefaultLocations } from "@/features/locations/actions/fetchDefaultLocations";
import { fetchLocations } from "@/features/locations/actions/fetchLocations";

// TYPES
import type { typesUser } from "@/features/players/types/typesPlayer";
import type { typesLocation } from "@/features/locations/types/typesLocation";

export default async function AddMatchPage() {
    const serverUserData = await getUser() as typesUser;

    const serverFetchLocationsData = await fetchLocations();
    const locationsData = serverFetchLocationsData.data as typesLocation[];
    
    const serverDefaultLocationsData = await fetchDefaultLocations();
    const defaultLocationsData = serverDefaultLocationsData.data as typesLocation[];

    return (
        <section className="flex w-full min-h-screen py-6 px-4 sm:px-6 lg:px-8">
            {/* No need for individual Suspenses here because AddMAtchDetails is client component so we have to fetch data on page.tsx therefore we utilize loading.tsx */}
            <Card className="w-full max-w-2xl mx-auto">
                <UserDetails currentUserName={serverUserData.name} />

                {/* Client component */}
                <AddMatchDetails 
                    serverUserData={serverUserData} 
                    locationsData={locationsData}
                    defaultLocationsData={defaultLocationsData}
                />
            </Card>
        </section>
    );
}