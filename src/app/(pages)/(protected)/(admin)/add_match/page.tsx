// COMPONENTS
import { Card } from "@/components/ui/card";
import { UserDetails } from "@/components/(pages)/(protected)/(admin)/add_match/user-details";
import { AddMatchDetails } from "@/components/(pages)/(protected)/(admin)/add_match/add-match-details";

// ACTIONS
import { getUser } from "@/actions/auth/verifyAuth";
import { fetchDefaultLocations } from "@/actions/location/fetchDefaultLocations";
import { fetchLocations } from "@/actions/location/fetchLocations";

// TYPES
import type { typesUser } from "@/types/typesUser";
import type { typesLocation } from "@/types/typesLocation";

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
                <UserDetails currentUserFullName={serverUserData.fullName} />

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